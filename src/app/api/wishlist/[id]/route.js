import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import { getSession } from '../../../../lib/auth';
import mongoose from 'mongoose';
import logger from '../../../../lib/logger';
import { errorResponse, successResponse } from '../../../../lib/apiUtils';

export const dynamic = 'force-dynamic'; // Ensure route is not cached

// GET - Fetch a specific wishlist item
export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return errorResponse('Item ID is required', 400);
    }
    
    await connectDB();
    const session = await getSession(req);
    
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    let query;
    try {
      // Try to use MongoDB ObjectId
      const objectId = new mongoose.Types.ObjectId(id);
      query = { _id: session.userId, 'wishlist._id': objectId };
    } catch (castError) {
      // If ObjectId conversion fails, try with clientId
      query = { _id: session.userId, 'wishlist.clientId': id };
    }

    const user = await User.findOne(query, { 
      'wishlist.$': 1 
    });
    
    if (!user || !user.wishlist || user.wishlist.length === 0) {
      return errorResponse('Item not found', 404);
    }
    
    return successResponse({ item: user.wishlist[0] });
  } catch (error) {
    logger.error('Error fetching wishlist item:', error);
    return errorResponse('Failed to fetch wishlist item', 500);
  }
}

// PUT - Update a wishlist item
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return errorResponse('Item ID is required', 400);
    }
    
    await connectDB();
    const session = await getSession(req);
    
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return errorResponse('Invalid request body', 400);
    }

    const { url, manualDetails = {} } = body;
    if (!url) {
      return errorResponse('URL is required', 400);
    }
    
    // Determine if we're using ObjectId or clientId for the query
    let updateQuery;
    try {
      // Try to use MongoDB ObjectId
      const objectId = new mongoose.Types.ObjectId(id);
      updateQuery = { _id: session.userId, 'wishlist._id': objectId };
    } catch (castError) {
      // If ObjectId conversion fails, try with clientId
      updateQuery = { _id: session.userId, 'wishlist.clientId': id };
    }
    
    // First, get the current item to preserve any fields not updated by scraping
    const currentUser = await User.findOne(
      updateQuery,
      { 'wishlist.$': 1 }
    );
    
    if (!currentUser || !currentUser.wishlist || currentUser.wishlist.length === 0) {
      return errorResponse('Item not found', 404);
    }
    
    const currentItem = currentUser.wishlist[0].toObject();
    
    const { scrapeProductDetails } = await import('../../../../lib/scraper');
    try {
      // Configure scraping options
      const scrapingOptions = {
        allowPartialResults: true,
        timeout: 20000
      };
      
      // Attempt to scrape product details
      const scrapedDetails = await scrapeProductDetails(url, scrapingOptions);
      
      // Extract scraping status
      const { scrapingStatus, ...productDetails } = scrapedDetails;
      
      // Merge the data in this order:
      // 1. Current item data (as base)
      // 2. Newly scraped data (overrides base)
      // 3. Manual details provided by user (highest priority)
      // 4. Always keep original clientId and _id
      const mergedData = {
        ...currentItem,
        ...productDetails,
        ...manualDetails,
        // Always preserve these fields
        _id: currentItem._id,
        clientId: currentItem.clientId,
        // Always update these fields
        url,
        scrapedAt: new Date().toISOString(),
        updatedAt: new Date()
      };
      
      // Remove the scrapingStatus from the data to be saved
      delete mergedData.scrapingStatus;
      
      // Update the item in the database
      const user = await User.findOneAndUpdate(
        updateQuery,
        { $set: { 'wishlist.$': mergedData } },
        { new: true, projection: { 'wishlist.$': 1 } }
      );
      
      if (!user || !user.wishlist || user.wishlist.length === 0) {
        return errorResponse('Item not found after update', 404);
      }
      
      return successResponse({ 
        message: 'Item updated successfully',
        item: user.wishlist[0],
        scrapingStatus
      });
    } catch (error) {
      logger.error('Error updating wishlist item:', error);
      
      // If scraping failed but we have manual details, update with those
      if (Object.keys(manualDetails).length > 0) {
        try {
          // Update only the manual fields and URL
          const updateFields = {};
          
          // Add each manual field to the update
          Object.keys(manualDetails).forEach(key => {
            updateFields[`wishlist.$.${key}`] = manualDetails[key];
          });
          
          // Always update these fields
          updateFields['wishlist.$.url'] = url;
          updateFields['wishlist.$.updatedAt'] = new Date();
          
          // Update the item with manual details only
          const user = await User.findOneAndUpdate(
            updateQuery,
            { $set: updateFields },
            { new: true, projection: { 'wishlist.$': 1 } }
          );
          
          if (!user || !user.wishlist || user.wishlist.length === 0) {
            return errorResponse('Item not found after manual update', 404);
          }
          
          return successResponse({ 
            message: 'Item updated with manual details. Automatic scraping failed.',
            item: user.wishlist[0],
            scrapingStatus: {
              isComplete: false,
              warnings: [error.message || 'Failed to scrape product details'],
              siteSupported: false
            }
          });
        } catch (manualUpdateError) {
          logger.error('Error updating with manual details:', manualUpdateError);
          return errorResponse('Failed to update item with manual details', 500);
        }
      }
      
      return errorResponse(error.message || 'Failed to update item', 500);
    }
  } catch (error) {
    logger.error('Error in PUT wishlist/[id]:', error);
    return errorResponse('Failed to update wishlist item', 500);
  }
}

// PATCH - Update specific fields of a wishlist item without re-scraping
export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return errorResponse('Item ID is required', 400);
    }
    
    await connectDB();
    const session = await getSession(req);
    
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return errorResponse('Invalid request body', 400);
    }

    // Allow updating more fields without re-scraping
    const allowedFields = [
      'name',           // Product name
      'price',          // Current price
      'originalPrice',  // Original price (for tracking discounts)
      'thumbnail',      // Product image URL
      'description',    // Product description
      'notes',          // User's personal notes
      'priority',       // User's priority level
      'status',         // Item status (active, purchased, etc.)
      'currency'        // Currency code
    ];
    
    const updateData = {};
    
    // Filter out only allowed fields
    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[`wishlist.$.${key}`] = body[key];
      }
    });
    
    // Add updatedAt timestamp
    updateData['wishlist.$.updatedAt'] = new Date();
    
    // If status is being changed to 'purchased', add purchasedAt timestamp
    if (body.status === 'purchased') {
      updateData['wishlist.$.purchasedAt'] = new Date();
    }
    
    if (Object.keys(updateData).length <= 1) { // Only has updatedAt
      return errorResponse('No valid fields to update', 400);
    }
    
    // Determine if we're using ObjectId or clientId
    let updateQuery;
    try {
      // Try to use MongoDB ObjectId
      const objectId = new mongoose.Types.ObjectId(id);
      updateQuery = { _id: session.userId, 'wishlist._id': objectId };
    } catch (castError) {
      // If ObjectId conversion fails, try with clientId
      updateQuery = { _id: session.userId, 'wishlist.clientId': id };
    }
    
    const user = await User.findOneAndUpdate(
      updateQuery,
      { $set: updateData },
      { new: true, projection: { 'wishlist.$': 1 } }
    );
    
    if (!user || !user.wishlist || user.wishlist.length === 0) {
      return errorResponse('Item not found', 404);
    }
    
    return successResponse({ 
      message: 'Item updated successfully',
      item: user.wishlist[0]
    });
  } catch (error) {
    logger.error('Error in PATCH wishlist/[id]:', error);
    return errorResponse('Failed to update wishlist item', 500);
  }
}

// DELETE - Remove a wishlist item
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return errorResponse('Item ID is required', 400);
    }
    
    await connectDB();
    const session = await getSession(req);
    
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    try {
      // Try to create an ObjectId, if it fails, we'll look for clientId instead
      let result;
      
      try {
        // First try with MongoDB ObjectId
        const objectId = new mongoose.Types.ObjectId(id);
        result = await User.updateOne(
          { _id: session.userId },
          { $pull: { wishlist: { _id: objectId } } }
        );
      } catch (castError) {
        // If ObjectId conversion fails, try with clientId
        result = await User.updateOne(
          { _id: session.userId },
          { $pull: { wishlist: { clientId: id } } }
        );
      }

      if (result.modifiedCount === 0) {
        return errorResponse('Item not found', 404);
      }

      return successResponse({ 
        message: 'Item deleted successfully',
        id: id
      });
    } catch (error) {
      logger.error('Error deleting wishlist item:', error);
      return errorResponse('Failed to delete item', 500);
    }
  } catch (error) {
    logger.error('Error in DELETE wishlist/[id]:', error);
    return errorResponse('Failed to delete wishlist item', 500);
  }
}
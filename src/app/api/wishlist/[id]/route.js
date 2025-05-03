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

    const { url } = body;
    if (!url) {
      return errorResponse('URL is required', 400);
    }
    
    const { scrapeProductDetails } = await import('../../../../lib/scraper');
    try {
      const details = await scrapeProductDetails(url);
      
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
      
      // Update the item with new details and add updatedAt timestamp
      const updateData = { 
        url, 
        ...details,
        updatedAt: new Date() 
      };
      
      const user = await User.findOneAndUpdate(
        updateQuery,
        { $set: { 'wishlist.$': updateData } },
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
      logger.error('Error updating wishlist item:', error);
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

    // Only allow updating specific fields
    const allowedFields = ['name', 'notes', 'priority'];
    const updateData = {};
    
    // Filter out only allowed fields
    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[`wishlist.$.${key}`] = body[key];
      }
    });
    
    // Add updatedAt timestamp
    updateData['wishlist.$.updatedAt'] = new Date();
    
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
    const { id } = params;
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
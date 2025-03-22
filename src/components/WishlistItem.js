'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function WishlistItem({ item, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(item.url);
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/wishlist/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error('Failed to update item');
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <li className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      {editing ? (
        <div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white"
          />
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <button
            onClick={handleUpdate}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <Image
            src={item.thumbnail}
            alt={item.name}
            width={400} // Adjust based on your design
            height={160} // Adjust based on your design
            className="w-full h-40 object-cover rounded mb-2"
            unoptimized // Use if external images aren't supported by your host
          />
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {item.name}
          </a>
          <p className="text-gray-600 dark:text-gray-300">Price: ${item.price}</p>
          <p className="text-gray-500 dark:text-gray-400">Site: {item.site}</p>
          <div className="mt-2">
            <button
              onClick={() => setEditing(true)}
              className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
}
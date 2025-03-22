import connectDB from '../../../lib/db';
import User from '../../../models/User';

export default async function Profile({ params }) {
  await connectDB();
  const user = await User.findOne({ slug: params.slug }, 'username wishlist');
  if (!user) return <div className="text-center mt-10">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">{user.username}&apos;s Wishlist</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {user.wishlist.map((item) => (
          <li key={item._id} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <img src={item.thumbnail} alt={item.name} className="w-full h-40 object-cover rounded mb-2" />
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              {item.name}
            </a>
            <p className="text-gray-600 dark:text-gray-300">Price: ${item.price}</p>
            <p className="text-gray-500 dark:text-gray-400">Site: {item.site}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function generateMetadata({ params }) {
  await connectDB();
  const user = await User.findOne({ slug: params.slug }, 'username');
  if (!user) return { title: 'User Not Found - WishAble' };
  return {
    title: `${user.username}'s Wishlist - WishAble`,
    description: `Check out ${user.username}'s wishlist on WishAble.`,
  };
}
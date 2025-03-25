import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";

import { useMutation } from "@tanstack/react-query";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Posts = () => {

	const {data: posts, isError, isLoading, error} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/posts/all");
				const data = await res.json();
				if(!res.ok) throw new Error(data.error) || "Something went wrong";
			
				return data;
				
			} catch (error) {
				throw new Error(error)		
			}
		}
	})
	

	return (
		<>
		{	console.log("Posts data", posts)}
			{isLoading && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;
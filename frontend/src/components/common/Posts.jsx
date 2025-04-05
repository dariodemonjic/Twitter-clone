import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Posts = ({feedType, username, userId}) => {


	const getPostEndpoint = () => {
		switch (feedType) {
			case "forYou":
				return "/api/posts/all";
			case "following" : 
				return "/api/posts/following";
			case "posts" : 
				return `/api/posts/user/${username}`;
			case "likes" : 
				return `/api/posts/likedPosts/${userId}`;
			default: 
				return "/api/posts/all";
		}
	};

	const POST_ENDPOINT = getPostEndpoint();

	const {data: posts, isError, isLoading, error, isRefetching} = useQuery({
		queryKey: ["posts", feedType, username, userId],  //Auto-refetches when feedType changes instead of ussing useEffect like i would generally
		queryFn: async () => {
			try {
				console.log(feedType);
				const res = await fetch(POST_ENDPOINT);
				const data = await res.json();
				if(!res.ok) throw new Error(data.error) || "Something went wrong";
				console.log("Posts data: ", data);
				return data;
				
			} catch (error) {
				throw new Error(error)		
			}
		}
	});

	
	

	return (
		<>
			{isLoading || isRefetching && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading &&  !isRefetching && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && !isRefetching && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} username={username} userId={userId} feedType={feedType} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;
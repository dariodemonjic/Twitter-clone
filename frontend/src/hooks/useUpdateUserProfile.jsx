import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const userUpdateUserProfile = () => {

    const queryClient = useQueryClient()

    const {mutate: updateUserProfile, isPending: isUpdatingProfile} = useMutation({
		mutationFn: async (formData) => {
			try {
				const res = await fetch ("/api/users/update", {
					method: "POST",
					headers: {
						"Content-Type" : "application/json",
					},
					body: JSON.stringify(formData),
				})

				const data = await res.json();
				if(!res.ok) throw error (data.json || "Something went wrong");

				return data;
				
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess : () => {
			
			toast.success("Post updated successuflly");
			 Promise.all([
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
				queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
			  ]);
		}

	})
    
    return {updateUserProfile, isUpdatingProfile}

}

export default userUpdateUserProfile;
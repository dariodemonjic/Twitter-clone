import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useFollow = () => {
    const queryClient = useQueryClient();

    const {mutate:followMutation, isError, isPending, error} = useMutation({
        mutationFn: async (userId) => {
            try {
                const res = await fetch (`/api/users/follow/${userId}` , {
                    method: "POST",
                })
                const data = await res.json();
                if(!res.ok) throw new Error (data.error || "Something went wrong");
                console.log("useFollow", data);
                return data;
                
            } catch (error) {
                throw new Error(error);
            }
            
        },
        onSuccess: () => {
            Promise.all([
                queryClient.invalidateQueries({queryKey: ["authUser"] }),
                queryClient.invalidateQueries({queryKey: ["suggestedUsers"] }),
            ])  
        }

    });

    return {followMutation, isPending};

};

export default useFollow;
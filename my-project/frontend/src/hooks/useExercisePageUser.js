import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUserModel } from "./useUserModel";

export function useExercisePageUser() {
    const navigate = useNavigate();

    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    }, []);

    // For postgreSQL it is needed to send userId
    //const name = user?.username ?? "";
    const name = user?.userId ?? "";
    const { userModel, fetchUserModel } = useUserModel({ enabled: !!name });

    useEffect(() => {
        if (!name) navigate("/");
    }, [name, navigate]);

    return {
        user,
        name,
        userModel,
        fetchUserModel,
    };
}
import React, {useState, useEffect} from "react"
import { Box, Button, Text, Stack, Menu} from "@chakra-ui/react"
import MenuItem from "./MenuItem";
import AuthButton from "./AuthButton";
import { supabase } from '../supabase';
import UserDisplay from "./UserDisplay";

const MenuLinks = ({isOpen}) => {
    const [userData, setUserData] = useState(null);
    const [username, setUsername] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
          try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            setUserData(user);
            setUsername(user.user_metadata.full_name);
          } catch (error) {
            console.error('Error fetching user metadata:', error.message);
          }
        };
    
        fetchUserData();
    }, []);

    return(
        <Box
          display={{ base: isOpen ? "block" : "none", md: "block" }}
          flexBasis={{ base: "100%", md: "auto" }}
        >
            <Stack 
              spacing={8} 
              align="center" 
              justify={["center", "space-between", "flex-end", "flex-end"]} 
              direction={["column", "row", "row", "row"]} 
              pt={[4, 4, 0, 0]}>
                <MenuItem to="/">Home</MenuItem>
                <MenuItem to="/rankings">Rankings</MenuItem>
                {username && <MenuItem to={"/career/" + username}>Career</MenuItem>}
                <AuthButton/>
            </Stack>
        </Box>
    );
}

export default MenuLinks;
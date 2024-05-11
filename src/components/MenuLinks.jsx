import React from "react"
import { Box, Button, Text, Stack, Menu} from "@chakra-ui/react"
import MenuItem from "./MenuItem";
import AuthButton from "./AuthButton";
import UserDisplay from "./UserDisplay";

const MenuLinks = () => {
    return(
        <Box>
            <Stack 
              spacing={8} 
              align="center" 
              justify={["center", "space-between", "flex-end", "flex-end"]} 
              direction={["column", "row", "row", "row"]} 
              pt={[4, 4, 0, 0]}>
                <MenuItem to="/">Home</MenuItem>
                <MenuItem to="/">Rankings</MenuItem>
                <MenuItem to="/">Career</MenuItem>
                <AuthButton/>
            </Stack>
        </Box>
    );
}

export default MenuLinks;
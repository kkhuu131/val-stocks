import React from "react"
import { Box, Text, Stack, Menu} from "@chakra-ui/react"
import MenuItem from "./MenuItem";

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
                <MenuItem to="/">Home2</MenuItem>
                <MenuItem to="/">Home3</MenuItem>
                <MenuItem to="/">Home4</MenuItem>
            </Stack>
        </Box>
    );
}

export default MenuLinks;
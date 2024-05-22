import React from "react"
import { Box, Button, Text, Stack, Menu, Flex} from "@chakra-ui/react"
import MenuItem from "./MenuItem";
import AuthButton from "./AuthButton";
import { supabase } from '../supabase';
import UserDisplay from "./UserDisplay";

const NavBarContainer = ({children, ...props}) => {
    return(
        <Flex
          as="nav"
          align="center"
          justify="space-between"
          wrap="wrap"
          w="100vw"
          maxW="100vw"
          p={6}
          pb={4}
          fontWeight="bold"
          bg={["black", "black", "black", "black"]}
          color={["white", "white", "white", "white"]}
          {...props} 
        >
            {children}
        </Flex>
    )
}

export default NavBarContainer;
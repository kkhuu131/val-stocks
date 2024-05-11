import React from "react"
import { Flex } from "@chakra-ui/react"

const NavBarContainer = ({children, ...props}) => {
    return(
        <Flex
          as="nav"
          align="center"
          justify="space-between"
          wrap="wrap"
          w="100%"
          p={6}
          pb={4}
          fontWeight="bold"
          bg={["black", "black", "black", "black"]}
          color={["black", "black", "black", "white"]}
          {...props} 
        >
            {children}
        </Flex>
    )
}

export default NavBarContainer;
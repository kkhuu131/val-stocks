import React from "react"
import { Box, Text, Link} from "@chakra-ui/react"

const MenuItem = ({ children, isLast, to = "/", ...rest }) => {
    return(
        <Link href={to} _hover={{textDecoration: "none",}}>
            <Text
              display="block"
              _hover={{
                color: "grayAlpha.100",
              }}
              {...rest}
        >
                {children}
            </Text>
        </Link>
    );
}

export default MenuItem;
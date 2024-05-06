import React from "react"
import { Box, Text} from "@chakra-ui/react"
import NavBarContainer from "./NavBarContainer";
import MenuLinks from "./MenuLinks";
import Logo from "./Logo";

const NavBar = (props) => {
    return(
        <NavBarContainer {...props}>
            <Logo w="100px"/>
            <MenuLinks />
        </NavBarContainer>
    );
}

export default NavBar;
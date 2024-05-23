import React from "react"
import { Box, Text, useMediaQuery} from "@chakra-ui/react"
import NavBarContainer from "./NavBarContainer";
import MenuLinks from "./MenuLinks";
import MenuToggle from "./MenuToggle";
import Logo from "./Logo";

const NavBar = (props) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const toggle = () => setIsOpen(!isOpen);

    return(
        <NavBarContainer {...props}>
            <Logo w="100px"/>
            <MenuToggle toggle={toggle} isOpen={isOpen}/>
            <MenuLinks isOpen={isOpen}/>
        </NavBarContainer>
    );
}

export default NavBar;
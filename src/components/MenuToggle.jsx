import React from "react"
import {
    Button,
    Box,
    Text,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuItemOption,
    MenuGroup,
    MenuOptionGroup,
    MenuDivider,
    AccordionIcon
  } from '@chakra-ui/react'
import Logo from "./Logo";
import { RiMenuAddFill } from "react-icons/ri";
import { RiMenuFill } from "react-icons/ri";

const MenuToggle = ({ toggle, isOpen }) => {
    return(
        <Box display={{ base: "block", md: "none" }} onClick={toggle}>
            {isOpen ? <RiMenuAddFill/> : <RiMenuFill/>}
        </Box>
    );
}

export default MenuToggle;
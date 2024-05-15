import React, {useState, useEffect} from 'react';
import { 
    Flex,
    Button,
    Box, 
    Image, 
    Text, 
    Spinner, 
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuItemOption,
    MenuGroup,
    MenuOptionGroup,
    MenuDivider, } from '@chakra-ui/react';
import { supabase } from '../supabase'

const UserDisplay = ({handleAuth}) => {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
  
    useEffect(() => {
        const fetchUserInfo = async () => {
        try {
            const {
            data: { user },
            } = await supabase.auth.getUser();
            if (user) {
            setUserData(user.user_metadata);
            setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching user info:', error.message);
        }
        };

        fetchUserInfo();
    }, []);

    if (!userData) {
        return(
            <Box></Box>
        );
    }    

    if (loading) {
        return <Spinner />;
    }
    return(
            <Flex>
                <Menu>
                    <MenuButton 
                    as={Button}
                    h="40px"
                    maxW="calc(100% - 20px)"
                    mx="auto"
                    border="0px"
                    backgroundColor="grayAlpha.600"
                    borderRadius="sm"
                    _hover={{
                    backgroundColor:"grayAlpha.500"
                    }}>
                        <Flex alignItems="center" justifyContent="center" m={2}>
                            <Image src={userData.picture} alt="Profile Picture" boxSize="30px" borderRadius="full" mr="2" />
                            <Text color="white" fontSize="16" fontWeight={"bold"}>{userData.full_name}</Text>
                        </Flex>
                    </MenuButton >
                <MenuList>
                    <MenuItem onClick={handleAuth}><Text color="white" fontSize="16" fontWeight={"bold"}>Log Out?</Text></MenuItem>
                </MenuList>
            </Menu>
            </Flex>
    );
};

export default UserDisplay;
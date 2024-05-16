import React, {useState, useEffect} from 'react';
import { Flex, Button, Text } from '@chakra-ui/react';
import { supabase } from '../supabase';
import UserDisplay from "./UserDisplay";

const AuthButton = () => {
    const [session, setSession] = useState(null)

    useEffect(() => {
        const session = supabase.auth.getSession();
    
        setSession(session);

        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleAuth = async () => {
        if (session) {
            await supabase.auth.signOut();
        } else {
            await supabase.auth.signInWithOAuth({
                provider: 'discord',
            })
        }
    };

    return(
        <Flex alignItems="center">
            {session ? 
                <UserDisplay handleAuth={handleAuth}/> : 

                <Button 
                onClick={handleAuth}
                w="90px"
                h="40px"
                border="0px"
                backgroundColor="grayAlpha.600"
                borderRadius="sm"
                _hover={{
                backgroundColor:"grayAlpha.500"
                }}
            >
                <Text
                    color="white"
                    fontSize="16"
                    fontWeight={"bold"}
                >
                    Login
                </Text>
            </Button>
            }
        </Flex>
    );
};

export default AuthButton;
import React, {useState, useEffect} from 'react';
import { Flex, Button, Text } from '@chakra-ui/react';
import env from "react-dotenv";
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

    const getURL = () => {
        let url =
          env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
          env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
          'http://localhost:3000/'
        // Make sure to include `https://` when not localhost.
        url = url.includes('http') ? url : `https://${url}`
        // Make sure to include a trailing `/`.
        url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
        return url
      }

    const handleAuth = async () => {
        if (session) {
            await supabase.auth.signOut();
        } else {
            await supabase.auth.signInWithOAuth({
                provider: 'discord',
                // options: {
                //     redirectTo: getURL(),
                // }
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
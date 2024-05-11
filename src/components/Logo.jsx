import React from "react"
import { Box, Grid, Text, Image} from "@chakra-ui/react"
import valorantLogo from "../ValorantLogo.png"

const Logo = () => {
    return(
        <Box>
            <Grid gridTemplateColumns="70px 250px" alignItems="center">
                <Image src={valorantLogo} alt={"valorantlogo"} h="70px"/>
                <Text fontSize="32" fontWeight="bold">
                    volarant stonks
                </Text>
            </Grid>
        </Box>
    );
}

export default Logo;
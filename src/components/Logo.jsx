import React from "react"
import { Box, Grid, Text, Image} from "@chakra-ui/react"
import valorantLogo from "../ValorantLogo.png"

const Logo = () => {
    return(
        <Box>
            <Grid gridTemplateColumns={["50px 250px", "70px 250px"]} alignItems="center">
                <Image src={valorantLogo} alt={"valorantlogo"} h={["50px", "70px"]}/>
                <Text fontSize={["24", "32"]} fontWeight="bold">
                    volarant stonks
                </Text>
            </Grid>
        </Box>
    );
}

export default Logo;
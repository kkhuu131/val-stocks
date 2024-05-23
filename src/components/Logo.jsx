import React from "react"
import { Box, Grid, Text, Image} from "@chakra-ui/react"
import valorantLogo from "../ValorantLogo.png"

const Logo = () => {
    return(
        <Box>
            <Grid gridTemplateColumns={["50px 200px", "70px 250px"]} alignItems="center">
                <Image src={valorantLogo} alt={"valorantlogo"} h={["50px", "70px"]}/>
                <Text fontSize={["24", "32"]} fontWeight="bold">
                    valstonks
                </Text>
            </Grid>
        </Box>
    );
}

export default Logo;
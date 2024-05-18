import React from "react"
import { Box, Button, Text, Stack, Menu} from "@chakra-ui/react"

const UserStocks = ({ stocks }) => {
    if (!stocks || Object.keys(stocks).length === 0) {
        return <Text color="white" fontSize={32}>No stocks owned</Text>;
    }

    return(
        <Box>
            {Object.entries(stocks).map(([symbol, amount]) => (
            <Text key={symbol} color="white">
                {symbol}: {amount}
            </Text>
            ))}
        </Box>
    );
}

export default UserStocks;
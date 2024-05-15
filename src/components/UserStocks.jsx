import React from "react"
import { Box, Button, Text, Stack, Menu} from "@chakra-ui/react"

const UserStocks = ({ stocks }) => {
    return(
        <Box>
            {Object.entries(stocks).map(([symbol, amount]) => (
            <Text key={symbol}>
                {symbol}: {amount}
            </Text>
            ))}
      </Box>
    );
}

export default UserStocks;
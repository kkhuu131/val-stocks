import React from "react";
import { 
    Box,
    Flex,
    Image,
    Text,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
} from "@chakra-ui/react";
import teamData from "../teamMappings.json";

const UserStocks = ({ stocks }) => {
    if (!stocks || Object.keys(stocks).length === 0) {
        return <Text color="white" fontSize={32}>No stocks owned</Text>;
    }

    return(
        <Box>
            <Table mx="auto" maxW="900px" minW="500px">
                <TableCaption></TableCaption>
                <Thead>
                    <Tr>
                        <Th color="grayAlpha.300">Stock</Th>
                        <Th color="grayAlpha.300">Shares</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {Object.entries(stocks)
                        .sort(([, amountA], [, amountB]) => amountB - amountA)
                        .map(([symbol, amount]) => (
                        <Tr>
                            <Td>
                                <Flex alignItems="center">
                                    <Image
                                    src={teamData["teamBySymbolMap"][symbol].img}
                                    alt={`Team logo for ${symbol}`}
                                    width="41"
                                    height="41"
                                    mr="2"
                                    objectFit="cover"
                                    />
                                    <Text mr="1" color="white" fontSize="16" fontWeight={"bold"}>
                                        {teamData.teamBySymbolMap[symbol].name}
                                    </Text>
                                    <Text color="white" fontSize="16">
                                        {symbol}
                                    </Text>
                                </Flex>
                            </Td>
                            <Td>
                                <Text color="white" fontSize="16" fontWeight={"bold"}>
                                    {amount}
                                </Text>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
}

export default UserStocks;
import React from "react";
import {
    Link,
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
                        <Link display="contents" href={"/stock/" + symbol}>
                            <Tr key={symbol} _hover={{ background: "grayAlpha.700"}}>
                                <Td verticalAlign="middle">
                                    <Flex alignItems="center">
                                        <Image
                                            src={teamData["teamBySymbolMap"][symbol].img}
                                            alt={`Team logo for ${symbol}`}
                                            width="41"
                                            height="41"
                                            objectFit="cover"
                                        />
                                        <Text m="5" color="white" fontSize="16" fontWeight={"bold"}>
                                            {teamData.teamBySymbolMap[symbol].name}
                                        </Text>
                                        <Text color="white" fontSize="16">
                                            {symbol}
                                        </Text>
                                    </Flex>
                                </Td>
                                <Td verticalAlign="middle">
                                    <Flex>
                                        <Text color="white" fontSize="16" fontWeight={"bold"}>
                                            {amount}
                                        </Text>
                                    </Flex>
                                </Td>
                            </Tr>
                        </Link>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
}

export default UserStocks;
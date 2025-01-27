import { memo, useEffect, useRef, useState } from 'react'
import './App.css'
import '@mantine/core/styles.css';
import { Text, ActionIcon, Autocomplete, Badge, Box, Button, Center, Code, Group, LoadingOverlay, MantineProvider, Modal, Pagination, ScrollArea, Switch, TextInput, useMantineColorScheme, useMantineTheme, Textarea, Checkbox, JsonInput, SimpleGrid } from '@mantine/core';
import { Container, Grid, Skeleton, Table, TableData } from '@mantine/core';
import { IconMoonFilled, IconSun, IconArrowRight, IconSearch, IconEdit } from '@tabler/icons-react'

import axios from 'axios';
import { useDisclosure } from '@mantine/hooks';

const instance = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    timeout: 2000,
    // headers: {'X-Custom-Header': 'foobar'}
});


const default_page_size = 20

const token = window.localStorage.getItem("token");

function App() {

    const [isEditable, setEditable] = useState(window.localStorage.getItem("token") != undefined ? true : false)

    const viewport = useRef<HTMLDivElement>(null);

    const { colorScheme, toggleColorScheme } = useMantineColorScheme()

    const theme = useMantineTheme();

    const [bodyData, setBodyData] = useState<any[]>([])

    const [searchInput, setSearchInput] = useState<string>("")

    const [current_search, setCurrentSearch] = useState<string | undefined>(undefined)

    const [activePage, setPage] = useState(1);

    const [totalRow, setTotalRow] = useState(0);

    const [isvisible, setVisible] = useState(false)

    const [openedDetail, setOpenedDetail] = useDisclosure(false);

    const [detail, setDetail] = useState<any>({})

    const scrollToTop = () => viewport.current!.scrollTo({ top: 0, behavior: 'instant' });

    useEffect(() => {
        if (current_search != undefined) {
            setPage(1)
            fetchData(current_search, 1, default_page_size)
        }
    }, [current_search])

    const fetchData = (text: string, page: number, page_size: number) => {
        setVisible(true)
        instance.post(`/search?key=${token == undefined ? '' : token}`, {
            "search_text": text,
            "page": page - 1,
            "page_size": page_size
        }).then((success: any) => {
            setBodyData(success.data.items)
            setTotalRow(success.data.total)
        }).finally(() => {
            setTimeout(() => {
                setVisible(false)
                scrollToTop()
            }, 500);

        })
    }



    return (
        <>

            <Container my="lg">
                <Grid>
                    <Grid.Col span={{ base: 12 }}>

                        <Group justify="right">
                            <ActionIcon
                                // variant="filled"
                                // aria-label="Settings"
                                onClick={() => { toggleColorScheme(); }}
                            >
                                {colorScheme === 'light'
                                    ? <IconSun style={{ width: '70%', height: '70%' }} stroke={1} />
                                    : <IconMoonFilled style={{ width: '70%', height: '70%' }} stroke={1} />
                                }
                            </ActionIcon>
                        </Group>

                        <Autocomplete
                            clearable={true}
                            value={searchInput}
                            style={{ marginTop: 20 }}
                            radius="xl"
                            size="md"
                            placeholder="Nhập nội dung tìm kiếm"
                            rightSectionWidth={42}
                            leftSection={
                                <IconSearch size={18} stroke={1.5} />
                            }
                            onChange={e => setSearchInput(e)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setCurrentSearch(searchInput)
                                }
                            }}
                            rightSection={
                                <ActionIcon size={32} radius="xl" color={theme.primaryColor} variant="filled"

                                    onClick={() => { setCurrentSearch(searchInput) }}
                                >
                                    <IconArrowRight size={18} stroke={1.5} />
                                </ActionIcon>
                            }
                        />

                        <div style={{ marginTop: 20 }}>
                            <Box pos="relative">
                                <LoadingOverlay visible={isvisible} zIndex={1000} overlayProps={{ radius: "sm", blur: 1 }} />
                                {bodyData.length === 0 && !isvisible ?
                                    <Center h={100} >
                                        <Box>
                                            {
                                                current_search == undefined ? "Nhập tên công ty và gõ 'enter' hoặc click 'Tìm kiếm'"
                                                    :
                                                    "Không tìm thấy kết quả"
                                            }</Box>
                                    </Center>
                                    :
                                    <>
                                        <DataTable
                                            isEditable={isEditable}
                                            elements={bodyData}
                                            openDetailCallback={(dt: any) => {
                                                console.log(dt)
                                                setDetail(dt)
                                                setOpenedDetail.open()
                                            }}
                                            viewport={viewport}
                                        />

                                        {
                                            totalRow / default_page_size > 1 && <Pagination style={{ marginTop: 20 }} value={activePage} onChange={(e) => {
                                                setPage(e)
                                                if (current_search != undefined)
                                                    fetchData(current_search, e, default_page_size)
                                            }} total={totalRow / default_page_size} />
                                        }

                                    </>


                                }

                            </Box>

                        </div>





                    </Grid.Col>

                </Grid>
            </Container>
            <DetailRow isEditable={isEditable} opened={openedDetail} element={detail} closeCallback={setOpenedDetail.close} />
        </>

    )
}

function DataTable(props: { isEditable: boolean, elements: any[], openDetailCallback?: any, viewport: any }) {

    var innerHeight = window.innerHeight ?? 0;

    const setIsHidden = (id: number, value: boolean) => {
        instance.put(`/reviews/${id}/is_hidden/${value}?key=${token}`).then((success: any) => {
            console.log(success)
        });
    }

    const setIsReviewed = (id: number, value: boolean) => {
        instance.put(`/reviews/${id}/is_reviewed/${value}?key=${token}`).then((success: any) => {
            console.log(success)
        });
    }

    const rows = props.elements.map((element) => (
        <Table.Tr key={element.Id}>
            {/* <Table.Td>{element.CompanyName}</Table.Td> */}
            <Table.Td>
                <Text c="blue" onClick={() => {
                    props.openDetailCallback(element)
                }}
                    style={{ cursor: "pointer" }}>
                    {element.CompanyName}
                </Text>

                {props.isEditable ?
                    <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs" style={{ paddingRight: 10, paddingTop: 10 }}>
                        <div><ActionIcon size={'sm'} onClick={() => { }}><IconEdit style={{ width: '70%', height: '70%' }} stroke={1.5} /></ActionIcon>
                            <span style={{ marginLeft: 10 }}>Edit</span></div>
                        <div><Checkbox aria-label="Select row" label="Hidden" defaultChecked={element.IsHidden} onClick={() => {
                            setIsHidden(element.Id, !element.IsHidden)
                        }} /> </div>
                        <div><Checkbox aria-label="Select row" label="Reviewed" defaultChecked={element.IsReviewed} onClick={() => {
                            setIsReviewed(element.Id, !element.IsReviewed)
                        }} /> </div>
                    </SimpleGrid> : <></>
                }
            </Table.Td>
            <Table.Td>{element.Salary}</Table.Td>
            <Table.Td>{element.Position}</Table.Td>
            <Table.Td>{element.Year}</Table.Td>
            <Table.Td>{element.Other}</Table.Td>
        </Table.Tr>
    ));


    return (
        <ScrollArea h={innerHeight == 0 ? 450 : innerHeight - 250} viewportRef={props.viewport}>
            <Table striped highlightOnHover stickyHeader >
                <Table.Thead>
                    <Table.Tr>
                        {/* <Table.Th>.No</Table.Th> */}
                        <Table.Th>Tên Công Ty</Table.Th>
                        <Table.Th>Lương</Table.Th>
                        <Table.Th>Vị Trí</Table.Th>
                        <Table.Th>Năm</Table.Th>
                        <Table.Th>Khác</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {rows}
                </Table.Tbody>
            </Table>
        </ScrollArea>

    );
}


function DetailRow(props: { isEditable: boolean, opened: boolean, element: any, closeCallback: any }) {


    return (
        <>
            <Modal opened={props.opened} onClose={props.closeCallback} title={props.element.CompanyName} size="md">

                {
                    props.element != undefined && props.element.JsonRawData != undefined ?
                        <JsonInput
                            autosize
                            minRows={2}
                            value={JSON.stringify(JSON.parse(props.element.JsonRawData), null, 4)}
                        />
                        : <></>
                }

            </Modal>

        </>
    );
}

export default App

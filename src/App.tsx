import { memo, useEffect, useRef, useState } from 'react'
import './App.css'
import '@mantine/core/styles.css';
import { Text, ActionIcon, Autocomplete, Badge, Box, Button, Center, Code, Group, LoadingOverlay, MantineProvider, Modal, Pagination, ScrollArea, Switch, TextInput, useMantineColorScheme, useMantineTheme, Textarea, Checkbox, JsonInput, SimpleGrid } from '@mantine/core';
import { Container, Grid, Skeleton, Table, TableData } from '@mantine/core';
import { IconMoonFilled, IconSun, IconArrowRight, IconSearch, IconEdit } from '@tabler/icons-react'

import axios from 'axios';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

const instance = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    timeout: 2000,
    // headers: {'X-Custom-Header': 'foobar'}
});


const default_page_size = 20

const token = window.localStorage.getItem("token");

function getUrl(url: string) {
    if (token != undefined && token != "")
        return url + "?key=" + token
    return url
}

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

    const [detailId, setDetailId] = useState<number | undefined>()

    const scrollToTop = () => viewport.current!.scrollTo({ top: 0, behavior: 'instant' });

    useEffect(() => {
        if (current_search != undefined) {
            setPage(1)
            fetchData(current_search, 1, default_page_size)
        }
    }, [current_search])

    const fetchData = (text: string, page: number, page_size: number) => {
        setVisible(true)
        instance.post(getUrl("/search"), {
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
                                            openDetailCallback={(dtid: any) => {
                                                console.log(dtid)
                                                setDetailId(dtid)
                                                setOpenedDetail.open()
                                            }}
                                            viewport={viewport}
                                        />

                                        {
                                            totalRow / default_page_size > 1 && <Pagination style={{ marginTop: 20 }} value={activePage} onChange={(e) => {
                                                setPage(e)
                                                if (current_search != undefined)
                                                    fetchData(current_search, e, default_page_size)
                                            }} total={totalRow / default_page_size + 1} />
                                        }

                                    </>


                                }

                            </Box>

                        </div>





                    </Grid.Col>

                </Grid>
            </Container>
            <DetailRow isEditable={isEditable} opened={openedDetail} review_id={detailId} closeCallback={setOpenedDetail.close} />
        </>

    )
}

function DataTable(props: { isEditable: boolean, elements: any[], openDetailCallback?: any, viewport: any }) {

    var innerHeight = window.innerHeight ?? 0;

    const setIsHidden = (id: number, value: boolean) => {
        instance.put(getUrl(`/reviews/${id}/is_hidden/${value}`)).then((success: any) => {
            console.log(success)
        });
    }

    const setIsReviewed = (id: number, value: boolean) => {
        instance.put(getUrl(`/reviews/${id}/is_reviewed/${value}`)).then((success: any) => {
            console.log(success)
        });
    }

    const rows = props.elements.map((element) => (
        <Table.Tr key={element.Id}>
            {/* <Table.Td>{element.CompanyName}</Table.Td> */}
            <Table.Td>
                <Text c="blue" onClick={() => {
                    if (props.isEditable)
                        props.openDetailCallback(element.Id)
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
            <Table striped highlightOnHover stickyHeader withTableBorder >
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


function DetailRow(props: { review_id: number | undefined, isEditable: boolean, opened: boolean, closeCallback: any }) {

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            company_name: '',
            salary: '',
            position: '',
            year: '',
            other: '',
        },

        // validate: {
        //     email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        // },
    });

    const [data, setData] = useState<any>(undefined)

    useEffect(() => {
        if (props.review_id != undefined) {
            instance.get(getUrl(`/reviews/${props.review_id}`)).then((success: any) => {
                console.log(success)
                setData(success.data)
            });
        }
    }, [props.review_id])

    return (
        <>
            <Modal opened={props.opened} onClose={props.closeCallback}
                title={"Cập nhật"}
                size="md">

                {/* {
                    props.element != undefined && props.element.JsonRawData != undefined ?
                        <JsonInput
                            autosize
                            minRows={2}
                            value={JSON.stringify(JSON.parse(props.element.JsonRawData), null, 4)}
                        />
                        : <></>
                } */}
                {
                    props.isEditable && props.review_id != undefined && data != undefined ?
                        <form
                            onSubmit={form.onSubmit((values) => {
                                console.log(values)
                                instance.put(getUrl(`/reviews/${props.review_id}`), {
                                    "company_name": data.CompanyName,
                                    "salary": data.Salary,
                                    "position": data.Position,
                                    "year": data.Year,
                                    "other": data.Other,
                                }).then((success: any) => {
                                    console.log(success)
                                    props.closeCallback()
                                });
                            })}>
                            <TextInput
                                // withAsterisk
                                label="Tên Công Ty"
                                placeholder="Tên Công Ty"
                                key={form.key("company_name")}
                                // {...form.getInputProps('email')}
                                value={data.CompanyName}
                                onChange={(e) => setData({ ...data, CompanyName: e.target.value })}
                            />

                            <TextInput
                                // withAsterisk
                                label="Lương"
                                placeholder="Lương"
                                key={form.key("salary")}
                                // {...form.getInputProps('email')}
                                value={data.Salary}
                                onChange={(e) => setData({ ...data, Salary: e.target.value })}
                            />
                            <TextInput
                                // withAsterisk
                                label="Vị trí"
                                placeholder="Vị trí"
                                key={form.key("position")}
                                // {...form.getInputProps('email')}
                                value={data.Position}
                                onChange={(e) => setData({ ...data, Position: e.target.value })}
                            />
                            <TextInput
                                // withAsterisk
                                label="Năm"
                                placeholder="Năm"
                                key={form.key("year")}
                                // {...form.getInputProps('email')}
                                value={data.Year}
                                onChange={(e) => setData({ ...data, Year: e.target.value })}
                            />
                            <TextInput
                                // withAsterisk
                                label="Khác"
                                placeholder="Khác"
                                key={form.key("other")}
                                // {...form.getInputProps('email')}
                                value={data.Other}
                                onChange={(e) => setData({ ...data, Other: e.target.value })}
                            />

                            <Group justify="flex-end" mt="md">
                                <Button type="submit">Submit</Button>
                            </Group>
                        </form>
                        : <></>
                }

            </Modal>

        </>
    );
}

export default App

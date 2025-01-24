import { memo, useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@mantine/core/styles.css';
import { ActionIcon, Button, Group, MantineProvider, Switch, TextInput, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { Container, Grid, Skeleton, Table, TableData } from '@mantine/core';
import { IconMoonFilled, IconSun, IconArrowRight, IconSearch } from '@tabler/icons-react'
import axios from 'axios';

const child = <Skeleton style={{
    background: "#ccc", marginTop: 5
}} height={140} radius="md" animate={false} />

const tableData: TableData = {
    // caption: 'Some elements from periodic table',
    head: ['Tên Công Ty', 'Lương', 'Khác', 'Năm'],
    body: [

    ],
};

const instance = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    timeout: 2000,
    // headers: {'X-Custom-Header': 'foobar'}
});


function App() {

    const { colorScheme, toggleColorScheme } = useMantineColorScheme()

    const theme = useMantineTheme();

    const [bodyData, setBodyData] = useState<any[]>([])

    const [search, setSearch] = useState<string>("")

    const fetchData = (search_key: string = "") => {
        instance.post("/search", {
            "search_text": search_key,
            "page": 0,
            "page_size": 20
        }).then((success: any) => {
            tableData.body?.push(["Công ty 1", "10.000.000", "Không", "20212"])

        })
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <>

            <Container my="md">
                <Grid>
                    <Grid.Col span={{ base: 12 }}>

                        <Group justify="right">
                            <Button size='xs' radius="lg" variant="default"
                                onClick={() => { toggleColorScheme() }}
                            >
                                {colorScheme === 'light' ? <IconSun /> : <IconMoonFilled />}
                            </Button>
                        </Group>

                        <TextInput
                            value={search}
                            style={{ marginTop: 20 }}
                            radius="xl"
                            size="md"
                            placeholder="Tìm kiếm công ty"
                            rightSectionWidth={42}
                            leftSection={<IconSearch size={18} stroke={1.5} />}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    fetchData(search)
                                }
                            }}
                            rightSection={
                                <ActionIcon size={32} radius="xl" color={theme.primaryColor} variant="filled"

                                    onClick={() => { fetchData(search) }}
                                >
                                    <IconArrowRight size={18} stroke={1.5} />
                                </ActionIcon>
                            }
                        // {...props}
                        />

                        <div style={{ marginTop: 20, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}>
                            <Table data={{
                                head: ['Tên Công Ty', 'Lương', 'Khác', 'Năm'],
                                body: bodyData
                            }} />
                        </div>



                    </Grid.Col>

                </Grid>
            </Container>
        </>

    )
}

export default App

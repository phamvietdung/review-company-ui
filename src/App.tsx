import { memo, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@mantine/core/styles.css';
import { ActionIcon, Button, Group, MantineProvider, Switch, TextInput, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { Container, Grid, Skeleton, Table, TableData } from '@mantine/core';
import { IconMoonFilled, IconSun, IconArrowRight, IconSearch } from '@tabler/icons-react'

const child = <Skeleton style={{
    background: "#ccc", marginTop: 5
}} height={140} radius="md" animate={false} />

const tableData: TableData = {
    // caption: 'Some elements from periodic table',
    head: ['Tên Công Ty', 'Lương', 'Khác', 'Năm'],
    body: [
        ["Công ty 1", "10.000.000", "Không", "2021"],
    ],
};


function App() {

    const { colorScheme, toggleColorScheme } = useMantineColorScheme()

    const theme = useMantineTheme();

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
                            style={{ marginTop: 20 }}
                            radius="xl"
                            size="md"
                            placeholder="Tìm kiếm công ty"
                            rightSectionWidth={42}
                            leftSection={<IconSearch size={18} stroke={1.5} />}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    console.log('search')
                                }
                            }}
                            rightSection={
                                <ActionIcon size={32} radius="xl" color={theme.primaryColor} variant="filled"

                                    onClick={() => { console.log('search') }}
                                >
                                    <IconArrowRight size={18} stroke={1.5} />
                                </ActionIcon>
                            }
                        // {...props}
                        />

                        <div style={{ marginTop: 20, padding: 10, borderRadius: 10, border: "1px solid #ddd" }}>
                            <Table data={tableData} />
                        </div>



                    </Grid.Col>

                </Grid>
            </Container>
        </>

    )
}

export default App

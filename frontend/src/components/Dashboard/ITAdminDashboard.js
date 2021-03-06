import React, { Component } from 'react';
import { Container, Row, Col, Table, Button, Badge } from 'react-bootstrap';
import { faHeartbeat, faTable } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HighchartsReact from 'highcharts-react-official';
import highcharts3d from 'highcharts/highcharts-3d'
import './Dashboard.css';
import cookie from 'react-cookies';

import Highcharts from "highcharts/highcharts.js";
import highchartsMore from "highcharts/highcharts-more.js";
import solidGauge from "highcharts/modules/solid-gauge.js";
import { Link } from 'react-router-dom';
highchartsMore(Highcharts);
solidGauge(Highcharts);
highcharts3d(Highcharts);

class ITAdminDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resources: [],
            authToken: cookie.load('cookie') || false,
            message: ''
        }
        this.getResourceCount = this.getResourceCount.bind(this);
    }
    getResourceCount = () => {
        const ambulance = {}, prescription = {}, monitoring = {}, cardiologist = {}, equipment = {};
        //create recource type obj as {10/10/2020:3,10/11/2020:4} date:count
        for (let key of this.state.resources) {
            let datealloc = new Date(key.lastUpdatedAt)
            // const dateString = datealloc.toLocaleDateString()
            // const datealloc = new Date(key.lastUpdatedAt)
            let dateString = new Intl.DateTimeFormat().format(datealloc)
            switch (key.resourceType) {
                case ('Ambulance'):
                    ambulance[dateString] = ambulance[dateString] ? ambulance[dateString] + 1 : 1;
                    break;
                case ("Medical Prescription"):
                    prescription[dateString] = prescription[dateString] ? prescription[dateString] + 1 : 1;
                    break;
                case ('Monitoring'):
                    monitoring[dateString] = monitoring[dateString] ? monitoring[dateString] + 1 : 1;
                    break;
                case ('Cardiologist'):
                    cardiologist[dateString] = cardiologist[dateString] ? cardiologist[dateString] + 1 : 1;
                    break;
                case ('Equipment'):
                    equipment[dateString] = equipment[dateString] ? equipment[dateString] + 1 : 1;
                    break;
                default:
                    break;
            }
        }
        // convert date : count to below format for each type
        //data: [[Date.UTC(2013, 11, 31), 43], [Date.UTC(2013, 11, 30), 52], [Date.UTC(2013, 11, 29), 57]]
        //1. Ambulance Chart Data
        const ambulanceData = [];
        for (let key in ambulance) {
            let d = new Date(key);
            ambulanceData.push([Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()), ambulance[key]]);
        }
        this.setState({ ambulanceDataChart: ambulanceData });

        //2. Cardiologist Chart Data
        const cardiologistData = [];
        for (let key in cardiologist) {
            let d = new Date(key);
            cardiologistData.push([Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()), cardiologist[key]]);
        }
        this.setState({ cardiologistDataChart: cardiologistData });

        //3. prescription Chart Data
        const prescriptionData = [];
        for (let key in prescription) {
            let d = new Date(key);
            prescriptionData.push([Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()), prescription[key]]);
        }
        this.setState({ prescriptionDataChart: prescriptionData });


        //4. monitoring Chart Data
        let monitoringData = [];
        for (let key in monitoring) {
            let d = new Date(key);
            monitoringData.push([Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()), monitoring[key]]);
        }
        this.setState({ monitoringDataChart: monitoringData });
        console.log("inside count", this.state.monitoringDataChart)

        //5. Equipment Chart Data
        const equipmentData = [];
        for (let key in equipment) {
            let d = new Date(key);
            equipmentData.push([Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()), monitoring[key]]);
        }
        this.setState({ equipmentDataChart: equipmentData });

    };

    async componentDidMount() {
        try {
            this.setState({
                authToken: cookie.load('cookie') || false
            })

            if (this.state.authToken) {

                //call active device counts
                fetch('api/v1/patient/activeDeviceCount', {
                    method: 'get',
                    mode: "cors",
                    redirect: 'follow',
                    headers: {
                        'content-type': 'application/json'
                    }
                }).then(async function (response) {
                    const body = await response.json();
                    return { status: response.status, body };
                }).then(async response => {
                    if (response.status === 200) {
                        console.log(response.body);
                        this.setState({
                            deviceCount: response.body.activeDeviceCount,
                        });
                    } else {
                        this.setState({
                            msg: body.message
                        })
                    }
                }).catch(async err => {
                    console.log(err)
                });

                //avg response time graph
                const avgresbody = await fetch('/api/v1/statistics/avgResponseTime', {
                    method: 'get',
                    mode: "cors",
                    redirect: 'follow',
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': this.state.authToken
                    },
                });
                let avgres = await avgresbody.json();
                if (avgres) {
                    const num = (avgres * 100).toFixed(2);
                    this.setState({
                        avgResponseTime: num
                    })
                }

                //throughput graph
                const throughput = await fetch('/api/v1/statistics/efficiency', {
                    method: 'get',
                    mode: "cors",
                    redirect: 'follow',
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': this.state.authToken
                    },
                });
                const throughputbody = await throughput.json();
                if (throughputbody) {
                    this.setState({
                        avgallocation: (throughputbody * 100).toFixed(2)
                    })
                }
                //Resource Type availability Pie Chart
                const resourcePieChart = await fetch('/api/v1/resource/availabilityInfo', {
                    method: 'get',
                    mode: "cors",
                    redirect: 'follow',
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': this.state.authToken
                    }
                });
                const resourcePieRes = await resourcePieChart.json();
                if (resourcePieRes) {
                    for (let res of resourcePieRes) {
                        console.log("pie response", res._id, res.availableResourcesCount);
                        switch (res._id) {
                            case ("Cardiologist"):
                                this.setState({ CardiologistPie: res.availableResourcesCount });
                                break;
                            case ("Ambulance"):
                                this.setState({ AmbulancePie: res.availableResourcesCount });
                                break;
                            case ("Monitoring"):
                                this.setState({ MonitoringPie: res.availableResourcesCount });
                                break;
                            case ("Equipment"):
                                this.setState({ EquipmentPie: res.availableResourcesCount });
                                break;
                            case ("Medical Prescription"):
                                this.setState({ PrescriptionPie: res.availableResourcesCount });
                                break;
                            default:
                                break;
                        }
                    }
                }
                //Call resource allocation details
                const response = await fetch(`/api/v1/resourceAllocation/all`, {
                    method: 'get',
                    mode: "cors",
                    redirect: 'follow',
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': this.state.authToken
                    },
                })
                const body = await response.json();
                if (response.status === 200) {
                    if (body) {
                        this.setState({
                            resources: body
                        })
                    }
                }
                this.setState({ message: response.status === 200 ? 'Success' : body.message });
                //count the resources allocated each day
                this.getResourceCount();
                //count allocation by status
                const statusCount = await fetch('api/v1/resourceAllocation/allocationInfo', {
                    method: 'get',
                    mode: "cors",
                    redirect: 'follow',
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': this.state.authToken
                    },
                });
                const statusbody = await statusCount.json();
                if (statusbody) {
                    console.log("status body", statusbody)
                    this.setState({
                        pendingCount: parseFloat((statusbody[0].pendingCount * 100).toFixed(2)),
                        completedCount: parseFloat((statusbody[0].completedCount * 100).toFixed(2)),
                        allocationCount: parseFloat((statusbody[0].allocationCount * 100).toFixed(2)),
                    })
                    console.log("status body", this.state.pendingCount, this.state.completedCount)
                }
            } else
                this.setState({ message: "Session expired login to continue" });
        }
        catch (e) {
            console.error(e);
            this.setState({ message: e.message || e });
        }
    }
    render() {

        const allocstatus = {
            chart: {
                type: 'solidgauge',
                height: '110%',
                events: {
                    render: renderIcons
                }
            },
            title: {
                text: 'Track Resource Allocation by Status',
                style: {
                    fontSize: '24px'
                }
            },
            tooltip: {
                borderWidth: 0,
                backgroundColor: 'none',
                shadow: false,
                style: {
                    fontSize: '16px'
                },
                valueSuffix: '%',
                pointFormat: '{series.name}<br><span style="font-size:2em; color: {point.color}; font-weight: bold">{point.y}</span>',
                positioner: function (labelWidth) {
                    return {
                        x: (this.chart.chartWidth - labelWidth) / 2,
                        y: (this.chart.plotHeight / 2) + 15
                    };
                }
            },
            pane: {
                startAngle: 0,
                endAngle: 360,
                background: [{ // Track for Move
                    outerRadius: '112%',
                    innerRadius: '88%',
                    backgroundColor: Highcharts.color(Highcharts.getOptions().colors[0])
                        .setOpacity(0.3)
                        .get(),
                    borderWidth: 0
                }, { // Track for Exercise
                    outerRadius: '87%',
                    innerRadius: '63%',
                    backgroundColor: Highcharts.color(Highcharts.getOptions().colors[1])
                        .setOpacity(0.3)
                        .get(),
                    borderWidth: 0
                }, { // Track for Stand
                    outerRadius: '62%',
                    innerRadius: '38%',
                    backgroundColor: Highcharts.color(Highcharts.getOptions().colors[2])
                        .setOpacity(0.3)
                        .get(),
                    borderWidth: 0
                }]
            },
            yAxis: {
                min: 0,
                max: 100,
                lineWidth: 0,
                tickPositions: []
            },
            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        enabled: false
                    },
                    linecap: 'round',
                    stickyTracking: false,
                    rounded: true
                }
            }, credits: {
                enabled: false
            },
            series: [
                {
                    name: 'Allocated',
                    data: [{
                        color: Highcharts.getOptions().colors[0],
                        radius: '112%',
                        innerRadius: '88%',
                        y: this.state.allocationCount
                    }]
                },
                {
                    name: 'Completed',
                    data: [{
                        color: Highcharts.getOptions().colors[1],
                        radius: '87%',
                        innerRadius: '63%',
                        y: this.state.completedCount
                    }]
                }, {
                    name: 'Pending',
                    data: [{
                        color: Highcharts.getOptions().colors[2],
                        radius: '62%',
                        innerRadius: '38%',
                        y: this.state.pendingCount
                    }]
                }]
        };
        const allocationgauge = {
            chart: {
                type: "solidgauge"
            },
            title: {
                text: 'Average Allocations %',
                style: {
                    fontSize: '24px'
                }
            },
            subtitle: {
                text: '% allocation done per request received'
            }, credits: {
                enabled: false
            },
            pane: {
                center: ['50%', '85%'],
                size: '100%',
                startAngle: -90,
                endAngle: 90,
                background: {
                    backgroundColor:
                        Highcharts.defaultOptions.legend.backgroundColor || '#EEE',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },
            exporting: {
                enabled: false
            },
            tooltip: {
                enabled: false
            },
            // the value axis
            yAxis: {
                stops: [
                    [0.10, '#DF5353'], // red
                    [0.50, '#DDDF0D'], // yellow
                    [0.70, '#55BF3B'] // green   
                ],
                lineWidth: 0,
                tickWidth: 0,
                minorTickInterval: null,
                tickAmount: 2,

                labels: {
                    y: 16
                },
                min: 0,
                max: 100,
                title: {
                    y: -70,
                    text: 'Avg Allocation %'

                }
            },
            series: [{
                name: 'Medical Resource Allocation Response Time',
                data: [parseFloat(this.state.avgallocation)],
                dataLabels: {
                    format:
                        '<div style="text-align:center">' +
                        '<span style="font-size:25px">{y}</span><br/>' +
                        '<span style="font-size:12px;opacity:0.4">% allocations</span>' +
                        '</div>'
                },
                tooltip: {
                    valueSuffix: ' Avg allocations %'
                }
            }]
        }
        const waitgauge = {
            chart: {
                type: "solidgauge"
            },
            title: {
                text: 'Average response time',
                style: {
                    fontSize: '24px'
                }
            },
            subtitle: {
                text: '% response time within SLA(5 mins)'
            }, credits: {
                enabled: false
            },
            pane: {
                center: ['50%', '85%'],
                size: '100%',
                startAngle: -90,
                endAngle: 90,
                background: {
                    backgroundColor:
                        Highcharts.defaultOptions.legend.backgroundColor || '#EEE',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },
            exporting: {
                enabled: false
            },
            tooltip: {
                enabled: false
            },
            // the value axis
            yAxis: {
                stops: [
                    [0.10, '#55BF3B'], // green
                    [0.50, '#DDDF0D'], // yellow
                    [0.90, '#DF5353'] // red
                ],
                lineWidth: 0,
                tickWidth: 0,
                minorTickInterval: null,
                tickAmount: 2,
                labels: {
                    y: 16
                },
                min: 0,
                max: 100,
                title: {
                    // text: 'Avg % response',
                    y: -70
                }
            },
            series: [{
                name: 'Average response time',
                data: [parseFloat(this.state.avgResponseTime)],
                dataLabels: {
                    format:
                        '<div style="text-align:center">' +
                        '<span style="font-size:25px">{y}</span><br/>' +
                        '<span style="font-size:12px;opacity:0.4">% response within SLA</span>' +
                        '</div>'
                },
                tooltip: {
                    valueSuffix: ' Average wait time'
                }
            }]
        }
        const lineAlloc = {
            title: {
                text: 'Resource Allocation Details by Resource Type'
            },
            subtitle: {
                text: 'Dynamic Resource Allocation Count'
            }, credits: {
                enabled: false
            },
            yAxis: {
                title: {
                    text: 'Number of Allocations'
                }
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: '%e %b'
                },
                accessibility: {
                    rangeDescription: 'Range: 2019 to 2020'
                }
            },
            legend: {
                layout: 'vertical',
                align: 'center',
                verticalAlign: 'bottom'
            },
            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false
                    },
                    pointStart: 20
                }
            },
            series: [{
                name: 'Ambulance',
                data: this.state.ambulanceDataChart
            }, {
                name: 'Cardiologist',
                data: this.state.cardiologistDataChart
            }, {
                name: "Medical Prescription",
                data: this.state.prescriptionDataChart
            }, {
                name: 'Monitoring',
                data: this.state.monitoringDataChart
            }, {
                name: 'Equipment',
                data: this.state.equipmentDataChart
            }],
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }
        }
        const ResourcePie = {
            chart: {
                type: 'pie',
            },
            title: {
                text: 'Resource Type Availability Chart'
            },
            credits: {
                enabled: false
            },
            accessibility: {
                point: {
                    valueSuffix: '%'
                }
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    depth: 35,
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}'
                    }
                }
            },
            series: [{
                type: 'pie',
                name: 'Resource Availability Percent',
                data: [
                    ['Ambulance', Number(this.state.AmbulancePie)],
                    ['Cardiologist', Number(this.state.CardiologistPie)],
                    ['Monitoring', Number(this.state.MonitoringPie)],
                    ['Medical Prescription', Number(this.state.PrescriptionPie)],
                    ['Equipment', Number(this.state.EquipmentPie)]
                    // ['Ambulance', 19],
                    // ['Cardiologist', 38],
                    // ['Monitoring', 19],
                    // ['Medical Prescription', 10],
                    // ['Equipment', 40]
                ]
            }]
        }
        const getTableEntries = () => {
            const xx = [];
            for (let [index, key] of this.state.resources.entries()) {

                if (index < 10) {
                    const datealloc = new Date(key.lastUpdatedAt)
                    let dateString = new Intl.DateTimeFormat(['ban', 'id']).format(datealloc)
                    xx.push(
                        <tr>
                            <td>{key.resourceType}</td>
                            <td>{key.healthcareProvider}</td>
                            <td>{key.patient}</td>
                            <td>{dateString}</td>
                            <td>{key.status}</td>
                            <td><Link to={`/resource/${key.healthcareProvider}`}><Button variant="info" >Manage</Button></Link></td>
                        </tr>
                    )
                }
            }
            return xx;
        }
        function renderIcons() {

            // Move icon
            if (!this.series[0].icon) {
                this.series[0].icon = this.renderer.path(['M', -8, 0, 'L', 8, 0, 'M', 0, -8, 'L', 8, 0, 0, 8])
                    .attr({
                        stroke: '#303030',
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        'stroke-width': 2,
                        zIndex: 10
                    })
                    .add(this.series[2].group);
            }
            this.series[0].icon.translate(
                this.chartWidth / 2 - 10,
                this.plotHeight / 2 - this.series[0].points[0].shapeArgs.innerR -
                (this.series[0].points[0].shapeArgs.r - this.series[0].points[0].shapeArgs.innerR) / 2
            );

            // Exercise icon
            if (!this.series[1].icon) {
                this.series[1].icon = this.renderer.path(
                    ['M', -8, 0, 'L', 8, 0, 'M', 0, -8, 'L', 8, 0, 0, 8,
                        'M', 8, -8, 'L', 16, 0, 8, 8]
                )
                    .attr({
                        stroke: '#ffffff',
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        'stroke-width': 2,
                        zIndex: 10
                    })
                    .add(this.series[2].group);
            }
            this.series[1].icon.translate(
                this.chartWidth / 2 - 10,
                this.plotHeight / 2 - this.series[1].points[0].shapeArgs.innerR -
                (this.series[1].points[0].shapeArgs.r - this.series[1].points[0].shapeArgs.innerR) / 2
            );

            // Stand icon
            if (!this.series[2].icon) {
                this.series[2].icon = this.renderer.path(['M', 0, 8, 'L', 0, -8, 'M', -8, 0, 'L', 0, -8, 8, 0])
                    .attr({
                        stroke: '#303030',
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        'stroke-width': 2,
                        zIndex: 10
                    })
                    .add(this.series[2].group);
            }

            this.series[2].icon.translate(
                this.chartWidth / 2 - 10,
                this.plotHeight / 2 - this.series[2].points[0].shapeArgs.innerR -
                (this.series[2].points[0].shapeArgs.r - this.series[2].points[0].shapeArgs.innerR) / 2
            );
        }
        return (
            <Container>
                {this.state.authToken ? <Container>
                    <div aria-live="polite" aria-atomic="true" style={{ position: 'relative', minHeight: '100px', }}>
                        <h2><FontAwesomeIcon icon={faHeartbeat} size="1x" style={{ marginRight: "1vw" }} />IT Admin Dashboard</h2>
                    </div>
                    <Row>
                        <Col><h1><Badge variant="success">Active Devices<br></br><br></br>{this.state.deviceCount}<br></br><br></br><h6> <Link to="/activepatient/all">more info</Link></h6></Badge></h1></Col>
                    </Row>
                    <Row >
                        <Col><HighchartsReact highcharts={Highcharts} options={allocstatus} /></Col>
                        <Col><HighchartsReact highcharts={Highcharts} options={allocationgauge} /></Col>
                        <Col><HighchartsReact highcharts={Highcharts} options={waitgauge} /></Col>
                    </Row>

                    <Row>
                        <Col><HighchartsReact highcharts={Highcharts} options={lineAlloc} /></Col>
                        <Col sm={5}><HighchartsReact highcharts={Highcharts} options={ResourcePie} /></Col>
                    </Row>
                    <div aria-live="polite" aria-atomic="true" style={{ position: 'relative', minHeight: '100px', }}>
                        <h3><FontAwesomeIcon icon={faTable} size="1x" style={{ marginRight: "1vw" }} />Top 10 Resource Allocation Details</h3>
                    </div>
                    <Row >
                        <Table striped hover variant="light">
                            <thead>
                                <tr>
                                    <th>Resource Type</th>
                                    <th>Provider Name</th>
                                    <th>Assigned To</th>
                                    <th>Assigned Date</th>
                                    <th>Status</th>
                                    <th>Manage Tab</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getTableEntries()}
                            </tbody>
                        </Table>
                    </Row>
                </Container> : ""}
                <p>{this.state.message}</p>
            </Container>
        );
    }
}
export default ITAdminDashboard;
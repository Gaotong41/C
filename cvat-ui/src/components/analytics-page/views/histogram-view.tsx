// Copyright (C) 2023 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

export interface HistogramDataset {
    label: string;
    data: number[];
    backgroundColor: string;
}

interface Props {
    labels: string[];
    datasets: HistogramDataset[];
    title: string;
    size?: number;
}

function HistogramView(props: Props): JSX.Element | null {
    const {
        datasets, labels, title,
    } = props;

    const data = {
        labels,
        datasets,
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: title,
            },
        },
    };

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <Bar options={options} data={data} />
        </div>
    );
}

export default React.memo(HistogramView);

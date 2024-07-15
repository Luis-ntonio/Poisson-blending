'use client';

import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import { useParams } from 'next/navigation'
import Poissonblending from "../components/Poissonblending/Poissonblending";

export default function poisson() {
    return (
        <main id="app" className="p-24">
            <Poissonblending/>
        </main>
    );
}
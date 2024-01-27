/// <reference types="vite/client" />
declare namespace App {}

type TimeData = {
	hours: number;
	minutes: number;
	seconds: number;
	hoursStr: string;
	minutesStr: string;
	secondsStr: string;
};

type Transcript = {
	file: MediaFile;
	rawOutput: string[];
	editedOutput: string[];
	name: string;
	status: 'empty' | 'transcribing' | 'transcribed' | 'error';
	duration: number | null;
};
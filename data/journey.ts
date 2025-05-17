export interface ExperienceProps {
	year: string;
	role: string;
	company: string;
	description: string;
	skills: string[];
	index: number;
}


export const experiences = [
		{
			year: 'Feb 2023 - Present',
			role: 'Senior Software Engineer',
			company: 'SHAYA',
			description:
				'Leading software development efforts with a focus on scalable architecture and AI integration. Applying software design patterns and DevOps practices in a remote, part-time setting.',
			skills: [
				'Node.js',
				'TypeScript',
				'Artificial Intelligence (AI)',
				'Software Design Patterns',
				'Software Architecture',
				'Kubernetes',
				'SDLC',
			],
		},
		{
			year: 'Mar 2020 - Feb 2023',
			role: 'Frontend Developer',
			company: 'SHAYA',
			description:
				'Developed modern frontend applications using React and TypeScript. Maintained responsive UI designs and collaborated in agile development teams.',
			skills: [
				'TypeScript',
				'JavaScript',
				'React.js',
				'Redux.js',
				'Node.js',
				'CSS',
				'Bootstrap',
				'Software Development',
			],
		},
		{
			year: 'May 2024 - Nov 2024',
			role: 'Senior Software Engineer',
			company: 'Maha',
			description:
				'Contributed to backend development using NestJS and Node.js within a microservices architecture. Implemented GraphQL APIs and managed data with MongoDB and SQL solutions.',
			skills: [
				'Node.js',
				'NestJS',
				'GraphQL',
				'Apollo GraphQL',
				'SQL',
				'MongoDB',
				'Mongoose ODM',
				'RabbitMQ',
				'Microservices',
				'Monorepo',
				'OpenTelemetry',
			],
		},
		{
			year: 'Aug 2022 - Jul 2023',
			role: 'Senior Frontend Developer',
			company: 'Datarivers Group',
			description:
				'Worked remotely as a freelance frontend engineer focusing on performance and clean UI/UX. Utilized Next.js and Tailwind CSS to deliver scalable applications.',
			skills: [
				'React.js',
				'Next.js',
				'JavaScript',
				'TypeScript',
				'Tailwind CSS',
				'React Hooks',
				'Node.js',
				'Functional Programming',
				'Software Development',
				'Supervisory Skills',
			],
		},
		{
			year: 'Jun 2022',
			role: 'Software Engineer',
			company: 'Sharif University of Technology',
			description:
				'Developed a custom library management system for Sharif University in collaboration with a small team. Delivered the project as a short-term contract.',
			skills: ['JavaScript', 'Next.js', 'Software Development'],
		},
];

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

import { AppWrapper, MotionWrapper } from "../../wrapper";
import { urlFor, client } from "../../client";

import "./Testimonials.scss";

const Testimonials = () => {
	const [brands, setBrands] = useState([]);
	const [testimonials, setTestimonials] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(0);

	const handleClick = (index) => {
		setCurrentIndex(index);
	}

	useEffect(() => {
		const query = '*[_type == "testimonials"]';
		const brandQuery = '*[_type == "brands"]';
		client.fetch(query).then((data) => {
			setTestimonials(data);
		});
		client.fetch(brandQuery).then((data) => {
			setBrands(data);
		});
	}, []);

	const crrtest = testimonials[currentIndex];

	return (
		<>
			{testimonials.length && (
				<>
					<div className="app__testimonial-item app__flex">
						<img src={urlFor(crrtest.imgurl)} alt="testimonial" />
						<div className="app__testimonial-content">
							<p className="p-text">{crrtest.feedback}</p>
							<div>
								<h4 className="text-bold">{crrtest.name}</h4>
								<h5 className="p-text">{crrtest.company}</h5>
							</div>
						</div>
					</div>
					<div className="app__testimonial-btns app__flex">
						<div className="app__flex" onClick={() => handleClick(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1)}>
							<HiChevronLeft />
						</div>
						<div className="app__flex" onClick={() => handleClick(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1)}>
							<HiChevronRight />
						</div>
					</div>
				</>
			)}

			<div className="app__testimonial-brands app__flex">
				{brands.map(brand => (
					<motion.div
						whileInView={{ opacity: [0, 1], }}
						transition={{ duration: 0.5, type: 'tween' }}
						key={brand._id}
					>
						<img src={urlFor(brand.imgUrl)} alt={brand.name}	 />
					</motion.div>
				))}

			</div>
		</>
	);
};

export default AppWrapper(
	MotionWrapper(Testimonials, "app__testimonial"),
	"testimonial",
	"app__primarybg"
);

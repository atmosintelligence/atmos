# Atmos Intelligence

This repository houses the code for Atmos Intelligence's core software, which is essentially a web server backed by Next.js. The website is available at: https://atmosintelligence.vercel.app

Atmos Intelligence is a smart environmental optimisation system designed to make indoor spaces more energy-efficient and sustainable. Using real-time sensor data, it analyzes room conditions and generates intelligent recommendations that help users reduce unnecessary energy consumption. By combining hardware sensing with cloud-based analytics, Atmos Intelligence transforms raw environmental data into actionable insights.

**Vision:** Atmos Intelligence envisions a future where every indoor space becomes self-aware, energy-efficient, and environmentally responsible.

**Mission:** Our mission is to transform passive rooms into intelligent ecosystems that continuously analyze their conditions and recommend sustainable actions. By making environmental intelligence accessible through simple hardware and cloud technology, we aim to democratize smart energy optimisation for homes, schools, offices, and public spaces.

Every day, significant amounts of energy are wasted in indoor environments simply because inefficiencies go unnoticed. Team Atmos is here to save the day!

## How It Works

Atmos Intelligence is built around a distributed sensing architecture comprising compact hardware devices equipped with environmental sensors. Each device continuously monitors parameters such as temperature, humidity, ambient light, power consumption, occupancy, and voltage. Users can deploy any number of devices across different rooms, with each securely transmitting telemetry to the Atmos cloud platform over an Internet connection.

Once the data reaches the cloud, it passes through a preprocessing pipeline where missing values are handled, noisy sensor readings are filtered, timestamps are standardised, and additional temporal features are engineered. This produces a consistent dataset suitable for both analytics and machine learning.

Atmos Intelligence combines deterministic engineering rules with machine learning to deliver reliable recommendations. Our rule-based engine continuously evaluates sensor data against established energy efficiency, environmental comfort, and safety criteria to identify immediate optimisation opportunities, such as unnecessary lighting, inefficient HVAC operation, phantom power loads, abnormal voltage conditions, and long-term consumption trends.

Alongside these rules, our machine learning pipeline analyses historical room behaviour to model normal operating patterns. Statistical anomaly detection identifies unusual energy consumption, feature engineering captures occupancy patterns and temporal trends, and predictive models estimate future energy demand while forecasting environmental conditions. Rather than making autonomous decisions, these models generate confidence scores and behavioural insights that complement the rule-based engine, enabling recommendations to be prioritised according to their predicted impact and reliability.

The processed information is presented through an interactive dashboard featuring real-time environmental monitoring, historical analytics, sustainability metrics, and actionable optimisation recommendations. Users can understand why a recommendation has been generated, estimate the potential savings, and make informed decisions to reduce both energy consumption and environmental impact over time.

## Tech Stack
For the website's backend and frontend, we are using the latest version of **Next.js**, an excellent and performant React framework! On top of Next, we are also utilising **Tailwind.css**.

**Machine learning:** Python 3.12 is used along with:

- Pandas: Sensor data cleaning
- NumPy: Matrix operations and numerical computations
- Scikit-learn: Regression, anomaly detection, preprocessing, feature engineering
- Joblib: Saving trained models and scalers
- Jupyter Notebook: Research and experimentation
- Ensemble Learning: Combines multiple models for inference
- SHAP: Explainable AI

Predictions and inferences are processed in Next.js's direction.

## Team Atmos

The project is a culmination of efforts by a curious group of high school students at Tagore International School, Vasant Vihar. This project was created in the summer of 2026, and is still pretty scalable.

© 2026 Atmos Intelligence. This project is under the MIT License. Made with 💖 in India.
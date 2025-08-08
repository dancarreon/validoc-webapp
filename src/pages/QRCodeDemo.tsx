import React from 'react';
import { QRCodeGenerator, QRCodeGeneratorForm } from '../components/QRCodeGenerator';

export const QRCodeDemo: React.FC = () => {
	const handleQRCodeGenerated = (dataUrl: string) => {
		console.log('QR Code generated:', dataUrl);
		// You can use this data URL for further processing
	};

	return (
		<div className="qr-demo-page">
			<div className="demo-header">
				<h1>QR Code Generator Demo</h1>
				<p>Generate custom QR codes with various options</p>
			</div>

			<div className="demo-sections">
				{/* Simple QR Code Generator */}
				<section className="demo-section">
					<h2>Simple QR Code Generator</h2>
					<p>Basic QR code with default settings</p>
					<QRCodeGenerator
						text="https://www.example.com"
						size={200}
						color="#000000"
						backgroundColor="#ffffff"
					/>
				</section>

				{/* Custom QR Code Generator */}
				<section className="demo-section">
					<h2>Custom QR Code Generator</h2>
					<p>QR code with custom colors and size</p>
					<QRCodeGenerator
						text="Hello, QR Code World!"
						size={250}
						color="#3b82f6"
						backgroundColor="#fef3c7"
						errorCorrectionLevel="H"
					/>
				</section>

				{/* Advanced QR Code Generator with Form */}
				<section className="demo-section">
					<h2>Advanced QR Code Generator</h2>
					<p>Interactive form to customize all QR code properties</p>
					<QRCodeGeneratorForm
						initialText="https://github.com"
						onQRCodeGenerated={handleQRCodeGenerated}
					/>
				</section>

				{/* Multiple QR Codes */}
				<section className="demo-section">
					<h2>Multiple QR Codes</h2>
					<p>Different QR codes for various use cases</p>
					<div className="qr-grid">
						<div className="qr-item">
							<h3>WiFi Network</h3>
							<QRCodeGenerator
								text="WIFI:T:WPA;S:MyNetwork;P:MyPassword123;;"
								size={150}
								color="#059669"
							/>
						</div>
						<div className="qr-item">
							<h3>Email</h3>
							<QRCodeGenerator
								text="mailto:example@email.com?subject=Hello&body=QR Code Test"
								size={150}
								color="#dc2626"
							/>
						</div>
						<div className="qr-item">
							<h3>Phone Number</h3>
							<QRCodeGenerator
								text="tel:+1234567890"
								size={150}
								color="#7c3aed"
							/>
						</div>
						<div className="qr-item">
							<h3>Text Message</h3>
							<QRCodeGenerator
								text="SMS:+1234567890:Hello from QR Code!"
								size={150}
								color="#ea580c"
							/>
						</div>
					</div>
				</section>
			</div>

			<style>{`
				.qr-demo-page {
					max-width: 1200px;
					margin: 0 auto;
					padding: 2rem;
				}

				.demo-header {
					text-align: center;
					margin-bottom: 3rem;
				}

				.demo-header h1 {
					font-size: 2.5rem;
					color: #1f2937;
					margin-bottom: 0.5rem;
				}

				.demo-header p {
					font-size: 1.125rem;
					color: #6b7280;
				}

				.demo-sections {
					display: flex;
					flex-direction: column;
					gap: 3rem;
				}

				.demo-section {
					border: 1px solid #e5e7eb;
					border-radius: 0.75rem;
					padding: 2rem;
					background: white;
				}

				.demo-section h2 {
					font-size: 1.5rem;
					color: #1f2937;
					margin-bottom: 0.5rem;
				}

				.demo-section p {
					color: #6b7280;
					margin-bottom: 1.5rem;
				}

				.qr-grid {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
					gap: 2rem;
				}

				.qr-item {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 1rem;
					padding: 1rem;
					border: 1px solid #e5e7eb;
					border-radius: 0.5rem;
					background: #f9fafb;
				}

				.qr-item h3 {
					font-size: 1rem;
					color: #374151;
					margin: 0;
				}

				@media (max-width: 768px) {
					.qr-demo-page {
						padding: 1rem;
					}

					.demo-header h1 {
						font-size: 2rem;
					}

					.qr-grid {
						grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
						gap: 1rem;
					}
				}
			`}</style>
		</div>
	);
};

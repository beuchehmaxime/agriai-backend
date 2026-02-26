import dotenv from 'dotenv';
import path from 'path';

// Set mock env vars BEFORE dynamic imports to avoid Prisma crash
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://mock:mock@localhost:5432/mockdb';

// Now import modules dynamically
const { DiagnosisService } = await import('../src/modules/diagnosis/diagnosis.service.js');
const { ImageRepository } = await import('../src/modules/image/image.repository.js');
const { DiagnosisRepository } = await import('../src/modules/diagnosis/diagnosis.repository.js');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Mock Repositories to isolate service logic
const mockImage = {
    id: 'test-image-id',
    url: 'https://example.com/test-plant-image.jpg', // Replace with a real URL if your ML service fetches it
    userId: 'test-user-id',
    createdAt: new Date(),
    updatedAt: new Date()
};

// We need to Monkey Patch (mock) the repositories on the prototype or instance for this test
// because the service initializes them in its constructor.
// A better pattern would be Dependency Injection, but for now we'll mock the prototype methods.

const originalFindById = ImageRepository.prototype.findById;
const originalCreateDiagnosis = DiagnosisRepository.prototype.create;

// Mock implementations
ImageRepository.prototype.findById = async (id: string) => {
    console.log(`[Mock] ImageRepository.findById called with ${id}`);
    return mockImage;
};

DiagnosisRepository.prototype.create = async (data: any) => {
    console.log(`[Mock] DiagnosisRepository.create called with:`, data);
    return { id: 'new-diagnosis-id', ...data, createdAt: new Date() };
};

async function runTest() {
    console.log('--- Starting Diagnosis Integration Test ---');
    console.log('ML_SERVICE_URL:', process.env.ML_SERVICE_URL || 'Not Set (Using default)');
    console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not Set');

    const service = new DiagnosisService();

    try {
        const result = await service.diagnoseImage('test-user-id', 'test-image-id', 'Test Location, Earth');
        console.log('\n--- Test Successful ---');
        console.log('Diagnosis Result:', result);
    } catch (error: any) {
        console.error('\n--- Test Failed ---');
        console.error(error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    } finally {
        // Restore original methods if needed (not strictly necessary for a one-off script)
        ImageRepository.prototype.findById = originalFindById;
        DiagnosisRepository.prototype.create = originalCreateDiagnosis;
    }
}

runTest();

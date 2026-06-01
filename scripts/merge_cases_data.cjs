// scripts/merge_cases_data.cjs
const fs = require('fs');
const path = require('path');

const baseDir = 'public/math_hints';

const pairs = [
  {
    corrupted: '경우의수2단계',
    clean: 'cases_step2'
  },
  {
    corrupted: '경우의수3단계',
    clean: 'cases_step3'
  },
  {
    corrupted: '경우의수4단계',
    clean: 'cases_step4'
  }
];

function mergeData() {
  console.log('=== Starting Cases AVS Metadata Merge ===\n');

  for (const pair of pairs) {
    const corruptedPath = path.join(baseDir, pair.corrupted);
    const cleanPath = path.join(baseDir, pair.clean);

    if (!fs.existsSync(corruptedPath)) {
      console.warn(`⚠️ Corrupted directory not found: ${corruptedPath}. Skipping...`);
      continue;
    }
    if (!fs.existsSync(cleanPath)) {
      console.warn(`⚠️ Clean template directory not found: ${cleanPath}. Skipping...`);
      continue;
    }

    console.log(`>>> Merging [${pair.corrupted}] -> [${pair.clean}]`);
    const files = fs.readdirSync(cleanPath).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const cleanFile = path.join(cleanPath, file);
      const corruptedFile = path.join(corruptedPath, file);

      if (!fs.existsSync(corruptedFile)) {
        console.warn(`  - [Skip] Corrupted file not found for ${file}`);
        continue;
      }

      try {
        const cleanData = JSON.parse(fs.readFileSync(cleanFile, 'utf8'));
        const corruptedData = JSON.parse(fs.readFileSync(corruptedFile, 'utf8'));

        // Extract metadata from corrupted
        const metadata = {
          correctAnswer: corruptedData.correctAnswer,
          answerType: corruptedData.answerType,
          pcbsa_completed: corruptedData.pcbsa_completed,
          status: corruptedData.status,
          correctChoiceIndex: corruptedData.correctChoiceIndex
        };

        // Merge clean LaTeX + corrupted metadata
        const mergedData = {
          ...cleanData,
          ...metadata
        };

        fs.writeFileSync(cleanFile, JSON.stringify(mergedData, null, 2), 'utf8');
        console.log(`  - [OK] Merged and saved ${file}`);
      } catch (err) {
        console.error(`  - [Error] Failed merging ${file}:`, err.message);
      }
    }
  }

  console.log('\n=== Merge Completed Successfully ===');
}

mergeData();

export class ScoringService {
    scoreMultipleSelect(correctAnswers: string[], studentAnswers: string[]): number {

        if (!Array.isArray(correctAnswers) || !Array.isArray(studentAnswers)) {
            throw new Error('Invalid input: expected arrays');
        }

        if (correctAnswers.length === 0 || studentAnswers.length === 0) {
            return 0;
        }

        let score = 0;

        const uniqueStudentAnswers = [...new Set(studentAnswers)];

        for (const answer of uniqueStudentAnswers) {
            if (correctAnswers.includes(answer)) {
                score += 1; 
            } else {
                score -= 0.5; 
            }
        }

        return Math.max(0, score);
    }

    getMaxScoreForMultipleSelect(correctAnswers: string[]): number {
        return correctAnswers.length;
    }

    scoreEssay(grades: number[], rubric: Record<string, number>): number {
        
        if (!grades || !Array.isArray(grades)) {
            throw new Error('Invalid input: grades must be an array');
        }
        if (!rubric || typeof rubric !== 'object' || Array.isArray(rubric)) {
            throw new Error('Invalid input: rubric must be an object');
        }

        if (grades.length === 0) return 0;

        if (grades.length !== Object.keys(rubric).length) {
            throw new Error('Number of grades must match number of rubric criteria');
        }

        const maxTotal = Object.values(rubric).reduce((sum, val) => sum + val, 0);
        const actualTotal = grades.reduce((sum, val) => sum + val, 0);
        return Math.min(actualTotal, maxTotal);
    }


    isEssayFullyGraded(grades: number[], rubric: Record<string, number>): boolean {
        return grades.length === Object.keys(rubric).length;
    }


    getEssayGradingInfo(grades: number[], rubric: Record<string, number>): {
        isFullyGraded: boolean;
        maxScore: number;
        currentScore: number;
        missingCriteria: string[];
        gradesByCriteria: Record<string, number>;
    } {
        const criteriaNames = Object.keys(rubric);
        const isFullyGraded = this.isEssayFullyGraded(grades, rubric);

        const gradesByCriteria: Record<string, number> = {};
        criteriaNames.forEach((name, index) => {
            if (index < grades.length) {
                gradesByCriteria[name] = grades[index];
            }
        });

        const missingCriteria = criteriaNames.filter((_, index) => index >= grades.length);

        return {
            isFullyGraded,
            maxScore: Object.values(rubric).reduce((sum, val) => sum + val, 0),
            currentScore: grades.reduce((sum, val) => sum + val, 0),
            missingCriteria,
            gradesByCriteria
        };
    }
}
export const scoringService = new ScoringService();

    

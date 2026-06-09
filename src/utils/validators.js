export const sportRules = {
    exerciseName: [
        v => !!v || 'Name is required',
        v => v?.length >= 2 || 'Minimum 2 characters',
        v => v?.length <= 50 || 'Maximum 50 characters',
    ],
    sets:     [v => (Number.isInteger(+v) && +v >= 1 && +v <= 20)   || 'Between 1 and 20'],
    reps:     [v => (Number.isInteger(+v) && +v >= 1 && +v <= 100)  || 'Between 1 and 100'],
    weight:   [v => (+v >= 0 && +v <= 500)                           || 'Between 0 and 500 kg'],
    restTime: [v => (Number.isInteger(+v) && +v >= 0 && +v <= 600)  || 'Between 0 and 600 seconds'],
    duration: [v => (Number.isInteger(+v) && +v >= 1 && +v <= 360)  || 'Between 1 and 360 minutes'],
}

export const englishRules = {
    grammarScore:   [v => (Number.isInteger(+v) && +v >= 0 && +v <= 100) || 'Between 0 and 100'],
    wordsLearned:   [v => (Number.isInteger(+v) && +v >= 0)               || 'Must be 0 or more'],
    wordsReviewed:  [v => (Number.isInteger(+v) && +v >= 0)               || 'Must be 0 or more'],
    oralDuration:   [v => (Number.isInteger(+v) && +v >= 1 && +v <= 300) || 'Between 1 and 300 minutes'],
    selfEval:       [v => (Number.isInteger(+v) && +v >= 1 && +v <= 5)   || 'Between 1 and 5'],
    totalPages:     [v => (Number.isInteger(+v) && +v >= 1 && +v <= 2000)|| 'Between 1 and 2000'],
}
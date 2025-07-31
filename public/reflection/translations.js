// Translation data
const translations = {
    en: {
        header: {
            title: "Student Reflection Portal"
        },
        greeting: {
            welcome: "Welcome to Your Reflection Space",
            message: "Take a moment to reflect on your learning journey. Your thoughts and insights are valuable for your personal growth and academic development.",
            today: "Today:"
        },
        reflection: {
            title: "Weekly Reflection Questions",
            question1: {
                label: "What are the most significant things you learned this week?",
                placeholder: "Describe your key learnings, concepts, skills, or insights..."
            },
            question2: {
                label: "What challenges did you face and how did you overcome them?",
                placeholder: "Share any difficulties you encountered and your problem-solving strategies..."
            },
            question3: {
                label: "How will you apply what you've learned to your future studies or career?",
                placeholder: "Connect your learning to real-world applications and future goals..."
            },
            save_draft: "Save Draft",
            submit: "Submit Reflection"
        },
        progress: {
            title: "Your Reflection Journey",
            total_reflections: "Total Reflections",
            this_month: "This Month",
            weekly_streak: "Weekly Streak"
        },
        footer: {
            copyright: "© 2025 Course Management Platform. All rights reserved.",
            support: "Need help? Contact your academic advisor or technical support."
        },
        modal: {
            success: {
                title: "Reflection Submitted Successfully!",
                message: "Thank you for taking the time to reflect on your learning. Your insights are valuable for your growth."
            },
            close: "Close"
        },
        messages: {
            draft_saved: "Draft saved successfully!",
            submission_success: "Reflection submitted successfully!",
            submission_error: "There was an error submitting your reflection. Please try again.",
            required_fields: "Please fill in all reflection questions before submitting."
        }
    },
    fr: {
        header: {
            title: "Portail de Réflexion Étudiant"
        },
        greeting: {
            welcome: "Bienvenue dans votre Espace de Réflexion",
            message: "Prenez un moment pour réfléchir à votre parcours d'apprentissage. Vos pensées et perspectives sont précieuses pour votre croissance personnelle et votre développement académique.",
            today: "Aujourd'hui:"
        },
        reflection: {
            title: "Questions de Réflexion Hebdomadaire",
            question1: {
                label: "Quelles sont les choses les plus importantes que vous avez apprises cette semaine?",
                placeholder: "Décrivez vos apprentissages clés, concepts, compétences ou perspectives..."
            },
            question2: {
                label: "Quels défis avez-vous rencontrés et comment les avez-vous surmontés?",
                placeholder: "Partagez les difficultés que vous avez rencontrées et vos stratégies de résolution de problèmes..."
            },
            question3: {
                label: "Comment allez-vous appliquer ce que vous avez appris à vos études futures ou votre carrière?",
                placeholder: "Reliez votre apprentissage aux applications du monde réel et aux objectifs futurs..."
            },
            save_draft: "Sauvegarder le Brouillon",
            submit: "Soumettre la Réflexion"
        },
        progress: {
            title: "Votre Parcours de Réflexion",
            total_reflections: "Réflexions Totales",
            this_month: "Ce Mois-ci",
            weekly_streak: "Série Hebdomadaire"
        },
        footer: {
            copyright: "© 2025 Plateforme de Gestion de Cours. Tous droits réservés.",
            support: "Besoin d'aide? Contactez votre conseiller académique ou le support technique."
        },
        modal: {
            success: {
                title: "Réflexion Soumise avec Succès!",
                message: "Merci d'avoir pris le temps de réfléchir à votre apprentissage. Vos perspectives sont précieuses pour votre croissance."
            },
            close: "Fermer"
        },
        messages: {
            draft_saved: "Brouillon sauvegardé avec succès!",
            submission_success: "Réflexion soumise avec succès!",
            submission_error: "Il y a eu une erreur lors de la soumission de votre réflexion. Veuillez réessayer.",
            required_fields: "Veuillez remplir toutes les questions de réflexion avant de soumettre."
        }
    }
};

// Export for use in script.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = translations;
} else {
    window.translations = translations;
}

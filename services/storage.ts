import { Project } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROJECTS_KEY = 'estimator_projects';

export const StorageService = {
    async getProjects(): Promise<Project[]> {
        try {
            const json = await AsyncStorage.getItem(PROJECTS_KEY);
            return json != null ? JSON.parse(json) : [];
        } catch (e) {
            console.error('Failed to load projects', e);
            return [];
        }
    },

    async saveProject(project: Project): Promise<void> {
        try {
            const projects = await this.getProjects();
            const existingIndex = projects.findIndex(p => p.id === project.id);

            let newProjects;
            if (existingIndex >= 0) {
                newProjects = [...projects];
                newProjects[existingIndex] = project;
            } else {
                newProjects = [project, ...projects];
            }

            await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
        } catch (e) {
            console.error('Failed to save project', e);
            throw e;
        }
    },

    async deleteProject(id: string): Promise<void> {
        try {
            const projects = await this.getProjects();
            const newProjects = projects.filter(p => p.id !== id);
            await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
        } catch (e) {
            console.error('Failed to delete project', e);
            throw e;
        }
    },

    async getProject(id: string): Promise<Project | null> {
        const projects = await this.getProjects();
        return projects.find(p => p.id === id) || null;
    }
};

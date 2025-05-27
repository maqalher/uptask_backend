import { Request, Response } from 'express';
export declare class TeamMemberController {
    static findMemeberByEmail: (req: Request, res: Response) => Promise<void>;
    static addMemberByID: (req: Request, res: Response) => Promise<void>;
    static removeMemberByID: (req: Request, res: Response) => Promise<void>;
    static getProjectTeam: (req: Request, res: Response) => Promise<void>;
}

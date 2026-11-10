export class User extends Base {
    public id: number;
    public firstName: string;
    public username?: string;
    constructor(client: BaleClient, data: any) {
        super(client);
        this.id = data.id;
        this.firstName = data.first_name;
        this.username = data.username;
    }
}
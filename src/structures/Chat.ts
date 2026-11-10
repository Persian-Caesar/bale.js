export class Chat extends Base {
    public id: number;
    public type: string;
    public title?: string;
    constructor(client: BaleClient, data: any) {
        super(client);
        this.id = data.id;
        this.type = data.type;
        this.title = data.title;
    }
}
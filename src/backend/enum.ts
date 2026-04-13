export enum EnhancedMode {
  RedirHost = "RedirHost",
  FakeIp = "FakeIp",
}

export interface DnsPolicyRule {
  domain: string;
  nameserver: string;
}

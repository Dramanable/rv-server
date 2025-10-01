import { PartialType } from "@nestjs/swagger";
import { CreateProspectDto } from "./create-prospect.dto";

/**
 * 🎯 UpdateProspectDto - DTO pour mettre à jour un prospect
 *
 * Hérite de CreateProspectDto avec tous les champs optionnels
 * pour permettre des mises à jour partielles.
 */
export class UpdateProspectDto extends PartialType(CreateProspectDto) {}

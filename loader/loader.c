#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>

#include "template.h"

static template_hd_t *template_hd;
static uint16_t *string_index;
static uint16_t *template_index;
static char* string_table;
static template_data_t *template_table;

#define _STR_LEN(off) 	(string_index[(off)+1] - string_index[off] - 1)
#define _STR_PTR(off)	(&string_table[string_index[off]])
#define _NSTR(off)	_STR_LEN(off), _STR_PTR(off)


void load_templates(char *data, int size)
{
    template_hd = (template_hd_t *)data;
    string_index = (uint16_t *)(data + template_hd->offset_string_index);
    template_index = (uint16_t *)(data + template_hd->offset_template_index);
    string_table = (char *)(data + template_hd->offset_string_table);
    template_table = (template_data_t *)(data + template_hd->offset_template_table);
}

void dump_templates(void)
{
    printf("Header ID: 0x%04x\n", template_hd->hd_id);
    printf("Total size: %d\n", template_hd->total_size);
    printf("CRC16: 0x%04x\n", template_hd->crc16);
    printf("Number of strings: %d\n", template_hd->num_strings);
    printf("Number of templates: %d\n", template_hd->num_templates);
    printf("Offset string index: %d\n", template_hd->offset_string_index);
    printf("Offset string table: %d\n", template_hd->offset_string_table);
    printf("Offset template index: %d\n", template_hd->offset_template_index);
    printf("Offset template table: %d\n", template_hd->offset_template_table);
    printf("\n========================================\n\n");

	for (int i = 0; i < template_hd->num_templates; i++) {
		int j;
		int level = 1;
		template_data_t *d = (template_data_t *)((char*)template_table + template_index[i]);
		printf("%s\n", _STR_PTR(d->name));
		printf("{\n");

		for (j = 0; j < d->num_fields; j++) {
			const char* t;
			static const char* space = "                                      ";
			int obj = 0;
			int end = 0;
			switch (d->f[j].type) {
			case DT_I8: t = "I8"; break;
			case DT_U8: t = "U8"; break;
			case DT_I16: t = "I16"; break;
			case DT_U16: t = "U16"; break;
			case DT_I32: t = "I32"; break;
			case DT_U32: t = "U32"; break;
			case DT_OBJECT: t = "OBJECT"; obj = 1; break;
			case DT_ARRAY: t = "ARRAY"; obj = 1; break;
			case DT_FIX_STR: t = "STR"; break;
			case DT_END: t = "}"; end = 1; break;
			default: t = ""; break;
			}

			if (end) {
				level--;
				printf("%.*s};\n", level, space);
			} else if (d->f[j].len > 0) {
				printf("%.*s%s %s[%d]%s\n", level, space, _STR_PTR(d->f[j].name), t, d->f[j].len, obj ? " {" : ";");
			} else {
				printf("%.*s%s %s%s\n", level, space, _STR_PTR(d->f[j].name), t, obj ? " {": ";");
			}
			if (obj) level++;
		}
		printf("}\n");
	}
}

int main(int argc, char *argv[])
{
    if (argc != 2) {
        printf("Usage: loader <file>\n");
        return 1;
    }

    FILE *f = fopen(argv[1], "rb");
    if (!f) {
        printf("Could not open file\n");
        return 1;
    }
    fseek(f, 0, SEEK_END);
    int size = ftell(f);
    fseek(f, 0, SEEK_SET);
    char *data = malloc(size);
    fread(data, 1, size, f);
    fclose(f);

    load_templates(data, size);
    dump_templates();

    free(data);
    return 0;
}
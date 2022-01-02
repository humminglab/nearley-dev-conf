#ifndef __TEMPLATE_H__
#define __TEMPLATE_H__

#include <stdint.h>

#define TEMPLATE_HEADER_ID	0x5aa5

typedef enum {
	DT_I8 = 1,
	DT_U8 = 2,
	DT_I16 = 3,
	DT_U16 = 4,
	DT_I32 = 5,
	DT_U32 = 6,
	DT_OBJECT = 7,
	DT_ARRAY = 8,
	DT_FIX_STR = 9,
	DT_END = 100,
} dt_type_t;

typedef struct {
	uint16_t name;
	uint8_t type;
	uint8_t reserved;
	uint16_t len;
} __attribute__((packed)) dc_field_t;

typedef struct {
	uint16_t name;
	uint16_t num_fields;
	dc_field_t f[1];
} __attribute__((packed)) template_data_t;

typedef struct {
	uint16_t hd_id;
	uint16_t total_size;
	uint16_t crc16;
	uint16_t num_strings;
	uint16_t num_templates;
	uint16_t offset_string_index;
	uint16_t offset_string_table;
	uint16_t offset_template_index;
	uint16_t offset_template_table;
} __attribute__((packed)) template_hd_t;

#endif
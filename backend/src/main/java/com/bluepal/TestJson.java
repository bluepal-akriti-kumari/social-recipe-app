package com.bluepal;

import com.bluepal.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;

public class TestJson {
    public static void main(String[] args) throws Exception {
        User user = User.builder().username("test").verified(true).restricted(true).build();
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        System.out.println(mapper.writeValueAsString(user));
    }
}

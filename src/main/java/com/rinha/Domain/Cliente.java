package com.rinha.Domain;   

public class Cliente {

    private final int id;
    private final String nome;
    private final long limite;
    private long saldo;

    public Cliente (int id, String nome, long limite, long saldo) {
        this.id = id;
        this.nome = nome;
        this.limite = limite;
        this.saldo = saldo;
    }
}
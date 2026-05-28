package com.app.golgo.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtProvider jwtProvider;

	public JwtAuthenticationFilter(JwtProvider jwtProvider) {
		this.jwtProvider = jwtProvider;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
		throws ServletException, IOException {
		String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (authorization != null && authorization.startsWith("Bearer ")) {
			JwtPrincipal principal = jwtProvider.parse(authorization.substring(7));
			UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
				principal,
				null,
				List.of(new SimpleGrantedAuthority("ROLE_USER"))
			);
			SecurityContextHolder.getContext().setAuthentication(authentication);
		}
		filterChain.doFilter(request, response);
	}
}
